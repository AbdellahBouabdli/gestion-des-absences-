package com.university.absence.service;

import com.university.absence.domain.Absence;
import com.university.absence.domain.AbsenceStatus;
import com.university.absence.domain.AppUser;
import com.university.absence.domain.Justification;
import com.university.absence.domain.JustificationStatus;
import com.university.absence.domain.Role;
import com.university.absence.dto.AbsenceDtos.JustificationResponse;
import com.university.absence.dto.AbsenceDtos.ReviewJustificationRequest;
import com.university.absence.exception.BadRequestException;
import com.university.absence.exception.ConflictException;
import com.university.absence.exception.NotFoundException;
import com.university.absence.repository.AbsenceRepository;
import com.university.absence.repository.JustificationRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class JustificationService {

    private final JustificationRepository justificationRepository;
    private final AbsenceRepository absenceRepository;
    private final AbsenceService absenceService;
    private final FileStorageService fileStorageService;
    private final DtoMapper mapper;

    public JustificationService(JustificationRepository justificationRepository,
                                AbsenceRepository absenceRepository,
                                AbsenceService absenceService,
                                FileStorageService fileStorageService,
                                DtoMapper mapper) {
        this.justificationRepository = justificationRepository;
        this.absenceRepository = absenceRepository;
        this.absenceService = absenceService;
        this.fileStorageService = fileStorageService;
        this.mapper = mapper;
    }

    @Transactional
    public JustificationResponse submit(AppUser student, Long absenceId, String reason, MultipartFile file) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Veuillez préciser le motif du justificatif.");
        }
        if (reason.length() > 1000) {
            throw new BadRequestException("Le motif ne peut pas dépasser 1000 caractères.");
        }
        Absence absence = absenceService.requireStudentOwned(student, absenceId);
        if (absence.getStatus() == AbsenceStatus.JUSTIFIED) {
            throw new ConflictException("Cette absence est déjà justifiée.");
        }
        Justification existing = justificationRepository.findByAbsenceId(absenceId).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == JustificationStatus.PENDING) {
                throw new ConflictException("Un justificatif est déjà en cours de vérification.");
            }
            if (existing.getStatus() == JustificationStatus.APPROVED) {
                throw new ConflictException("Le justificatif de cette absence a déjà été approuvé.");
            }
        }

        FileStorageService.StoredFile stored = fileStorageService.store(file);
        Justification justification = existing != null ? existing : new Justification();
        if (existing != null) {
            fileStorageService.delete(existing.getStorageKey());
        }
        justification.setAbsence(absence);
        justification.setReason(reason.trim());
        justification.setOriginalFileName(stored.originalName());
        justification.setStorageKey(stored.key());
        justification.setContentType(stored.contentType());
        justification.setFileSize(stored.size());
        justification.setStatus(JustificationStatus.PENDING);
        justification.setSubmittedAt(Instant.now());
        justification.setReviewedBy(null);
        justification.setReviewedAt(null);
        justification.setReviewComment(null);
        justificationRepository.save(justification);
        return mapper.toJustification(justification);
    }

    @Transactional(readOnly = true)
    public List<JustificationResponse> listForStudent(AppUser student) {
        return justificationRepository.findByAbsenceStudentIdOrderBySubmittedAtDesc(student.getId())
                .stream().map(mapper::toJustification).toList();
    }

    @Transactional(readOnly = true)
    public List<JustificationResponse> listForTeacher(AppUser teacher, JustificationStatus status) {
        List<Justification> items = status == null
                ? justificationRepository.findByAbsenceSessionTeacherIdOrderBySubmittedAtDesc(teacher.getId())
                : justificationRepository.findByAbsenceSessionTeacherIdAndStatusOrderBySubmittedAtAsc(teacher.getId(), status);
        return items.stream().map(mapper::toJustification).toList();
    }

    @Transactional
    public JustificationResponse review(AppUser teacher, Long id, ReviewJustificationRequest request) {
        Justification justification = justificationRepository.findWithDetailsById(id)
                .orElseThrow(() -> new NotFoundException("Justificatif introuvable"));
        if (!justification.getAbsence().getSession().getTeacher().getId().equals(teacher.getId())) {
            throw new AccessDeniedException("Ce justificatif ne relève pas de vos séances.");
        }
        if (request.status() != JustificationStatus.APPROVED && request.status() != JustificationStatus.REJECTED) {
            throw new BadRequestException("Le statut doit être APPROVED ou REJECTED.");
        }
        justification.setStatus(request.status());
        justification.setReviewedBy(teacher);
        justification.setReviewedAt(Instant.now());
        justification.setReviewComment(request.comment() == null || request.comment().isBlank()
                ? null : request.comment().trim());
        justification.getAbsence().setStatus(request.status() == JustificationStatus.APPROVED
                ? AbsenceStatus.JUSTIFIED : AbsenceStatus.ABSENT);
        justificationRepository.save(justification);
        absenceRepository.save(justification.getAbsence());
        return mapper.toJustification(justification);
    }

    @Transactional(readOnly = true)
    public DownloadFile download(AppUser user, Long id) {
        Justification justification = justificationRepository.findWithDetailsById(id)
                .orElseThrow(() -> new NotFoundException("Justificatif introuvable"));
        boolean allowed = user.getRole() == Role.ADMIN
                || (user.getRole() == Role.STUDENT && justification.getAbsence().getStudent().getId().equals(user.getId()))
                || (user.getRole() == Role.TEACHER
                    && justification.getAbsence().getSession().getTeacher().getId().equals(user.getId()));
        if (!allowed) {
            throw new AccessDeniedException("Vous n'avez pas accès à ce justificatif.");
        }
        Resource resource = fileStorageService.load(justification.getStorageKey());
        return new DownloadFile(resource, justification.getContentType(), justification.getOriginalFileName());
    }

    public record DownloadFile(Resource resource, String contentType, String fileName) {
    }
}
