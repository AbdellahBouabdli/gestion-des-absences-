package com.university.absence.web;

import com.university.absence.security.CurrentUser;
import com.university.absence.service.JustificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Fichiers", description = "Téléchargement sécurisé des justificatifs")
public class FileController {

    private final CurrentUser currentUser;
    private final JustificationService justificationService;

    public FileController(CurrentUser currentUser, JustificationService justificationService) {
        this.currentUser = currentUser;
        this.justificationService = justificationService;
    }

    @GetMapping("/justifications/{id}")
    @Operation(summary = "Télécharger le fichier d'un justificatif autorisé")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        JustificationService.DownloadFile download = justificationService.download(currentUser.get(), id);
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(download.contentType() == null
                    ? MediaType.APPLICATION_OCTET_STREAM_VALUE : download.contentType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(download.fileName() == null ? "justificatif" : download.fileName(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .cacheControl(CacheControl.noStore())
                .body(download.resource());
    }
}
