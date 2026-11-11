package com.university.absence.service;

import com.university.absence.exception.BadRequestException;
import com.university.absence.exception.StorageException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final long MAX_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf", "image/jpeg", "image/png");
    private static final Map<String, String> EXTENSIONS = Map.of(
            "application/pdf", ".pdf",
            "image/jpeg", ".jpg",
            "image/png", ".png"
    );

    private final Path root;

    public FileStorageService(@Value("${app.storage.location}") String location) {
        this.root = Paths.get(location).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException ex) {
            throw new StorageException("Impossible de préparer le dossier de stockage.", ex);
        }
    }

    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Veuillez joindre un justificatif (PDF, JPG ou PNG).");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BadRequestException("Le justificatif ne peut pas dépasser 5 Mo.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Format non autorisé. Utilisez un PDF, un JPG ou un PNG.");
        }
        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "justificatif" : file.getOriginalFilename());
        String extension = EXTENSIONS.getOrDefault(contentType, "");
        String key = UUID.randomUUID() + extension;
        try {
            Path target = root.resolve(key).normalize();
            if (!target.startsWith(root)) {
                throw new StorageException("Chemin de fichier invalide.");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return new StoredFile(key, originalName, contentType, file.getSize());
        } catch (IOException ex) {
            throw new StorageException("Le justificatif n'a pas pu être enregistré.", ex);
        }
    }

    public StoredFile storeGenerated(byte[] content, String originalName, String contentType) {
        String extension = EXTENSIONS.getOrDefault(contentType, "");
        String key = UUID.randomUUID() + extension;
        try {
            Path target = root.resolve(key).normalize();
            Files.write(target, content);
            return new StoredFile(key, originalName, contentType, content.length);
        } catch (IOException ex) {
            throw new StorageException("Le fichier de démonstration n'a pas pu être créé.", ex);
        }
    }

    public Resource load(String key) {
        try {
            Path path = root.resolve(key).normalize();
            if (!path.startsWith(root)) {
                throw new StorageException("Chemin de fichier invalide.");
            }
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new StorageException("Le justificatif est introuvable sur le serveur.");
            }
            return resource;
        } catch (java.net.MalformedURLException ex) {
            throw new StorageException("Le justificatif est introuvable sur le serveur.", ex);
        }
    }

    public void delete(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(root.resolve(key).normalize());
        } catch (IOException ignored) {
            // A missing file must never block deleting an absence.
        }
    }

    public record StoredFile(String key, String originalName, String contentType, long size) {
    }
}
