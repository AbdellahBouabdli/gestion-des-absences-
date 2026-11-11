package com.university.absence.service;

import com.university.absence.domain.Absence;
import com.university.absence.domain.AbsenceStatus;
import com.university.absence.domain.AppUser;
import com.university.absence.domain.CourseSession;
import com.university.absence.domain.Justification;
import com.university.absence.domain.JustificationStatus;
import com.university.absence.domain.Role;
import com.university.absence.dto.AbsenceDtos.AbsenceResponse;
import com.university.absence.dto.AbsenceDtos.CreateAbsenceRequest;
import com.university.absence.dto.AbsenceDtos.UpdateAbsenceRequest;
import com.university.absence.exception.BadRequestException;
import com.university.absence.exception.ConflictException;
import com.university.absence.exception.NotFoundException;
import com.university.absence.repository.AbsenceRepository;
import com.university.absence.repository.JustificationRepository;
import com.university.absence.repository.SessionRepository;
import com.university.absence.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AbsenceService {

    private final AbsenceRepository absenceRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final JustificationRepository justificationRepository;
    private final TeacherAccess teacherAccess;
    private final DtoMapper mapper;
    private final FileStorageService fileStorageService;

    public AbsenceService(AbsenceRepository absenceRepository, SessionRepository sessionRepository,
                          UserRepository userRepository, JustificationRepository justificationRepository,
                          TeacherAccess teacherAccess, DtoMapper mapper, FileStorageService fileStorageService) {
        this.absenceRepository = absenceRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.justificationRepository = justificationRepository;
        this.teacherAccess = teacherAccess;
        this.mapper = mapper;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public AbsenceResponse create(AppUser teacher, CreateAbsenceRequest request) {
        CourseSession session = sessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new NotFoundException("Séance introuvable"));
        teacherAccess.requireSession(teacher, session);
        if (session.getDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Une absence ne peut pas être enregistrée pour une séance future.");
        }
        AppUser student = userRepository.findById(request.studentId())
                .orElseThrow(() -> new NotFoundException("Étudiant introuvable"));
        if (student.getRole() != Role.STUDENT) {
            throw new BadRequestException("L'utilisateur sélectionné n'est pas un étudiant.");
        }
        if (student.getGroup() == null || !student.getGroup().getId().equals(session.getGroup().getId())) {
            throw new BadRequestException("Cet étudiant n'appartient pas au groupe de la séance.");
        }
        if (absenceRepository.existsByStudentIdAndSessionId(student.getId(), session.getId())) {
            throw new ConflictException("Une absence existe déjà pour cet étudiant sur cette séance.");
        }
        Absence absence = new Absence();
        absence.setStudent(student);
        absence.setSession(session);
        absence.setStatus(AbsenceStatus.ABSENT);
        absence.setNote(cleanNote(request.note()));
        absence.setRecordedBy(teacher);
        Absence saved = absenceRepository.save(absence);
        return mapper.toAbsence(saved, null);
    }

    @Transactional
    public AbsenceResponse update(AppUser teacher, Long id, UpdateAbsenceRequest request) {
        Absence absence = requireTeacherAbsence(teacher, id);
        AbsenceStatus previous = absence.getStatus();
        absence.setNote(cleanNote(request.note()));
        absence.setStatus(request.status());
        Justification justification = justificationRepository.findByAbsenceId(id).orElse(null);
        if (request.status() == AbsenceStatus.JUSTIFIED) {
            approvePendingJustification(justification, teacher, "Absence justifiée directement par l'enseignant.");
        } else if (previous == AbsenceStatus.JUSTIFIED && justification != null
                && justification.getStatus() == JustificationStatus.APPROVED) {
            justification.setStatus(JustificationStatus.REJECTED);
            justification.setReviewedBy(teacher);
            justification.setReviewedAt(Instant.now());
            justification.setReviewComment("Le statut de l'absence a été modifié par l'enseignant.");
            justificationRepository.save(justification);
        }
        absenceRepository.save(absence);
        return mapper.toAbsence(absence, justification);
    }

    @Transactional
    public AbsenceResponse justify(AppUser teacher, Long id) {
        Absence absence = requireTeacherAbsence(teacher, id);
        absence.setStatus(AbsenceStatus.JUSTIFIED);
        Justification justification = justificationRepository.findByAbsenceId(id).orElse(null);
        approvePendingJustification(justification, teacher, "Absence justifiée directement par l'enseignant.");
        absenceRepository.save(absence);
        return mapper.toAbsence(absence, justification);
    }

    @Transactional
    public void delete(AppUser teacher, Long id) {
        Absence absence = requireTeacherAbsence(teacher, id);
        justificationRepository.findByAbsenceId(id).ifPresent(justification -> {
            fileStorageService.delete(justification.getStorageKey());
            justificationRepository.delete(justification);
        });
        absenceRepository.delete(absence);
    }

    @Transactional(readOnly = true)
    public List<AbsenceResponse> teacherAbsences(AppUser teacher, Long groupId, Long studentId,
                                                 LocalDate from, LocalDate to) {
        if (from != null && to != null && to.isBefore(from)) {
            throw new BadRequestException("La date de fin doit être postérieure à la date de début.");
        }
        List<Absence> absences;
        if (from != null || to != null) {
            LocalDate start = from != null ? from : LocalDate.of(2000, 1, 1);
            LocalDate end = to != null ? to : LocalDate.now().plusYears(1);
            absences = absenceRepository
                    .findBySessionTeacherIdAndSessionDateBetweenOrderBySessionDateDescSessionStartTimeDesc(
                            teacher.getId(), start, end);
        } else {
            absences = absenceRepository.findBySessionTeacherIdOrderBySessionDateDescSessionStartTimeDesc(teacher.getId());
        }
        return absences.stream()
                .filter(absence -> groupId == null || absence.getSession().getGroup().getId().equals(groupId))
                .filter(absence -> studentId == null || absence.getStudent().getId().equals(studentId))
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AbsenceResponse> studentAbsences(AppUser student) {
        return absenceRepository.findByStudentIdOrderBySessionDateDescSessionStartTimeDesc(student.getId())
                .stream().map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public AbsenceResponse studentAbsence(AppUser student, Long id) {
        Absence absence = absenceRepository.findWithDetailsById(id)
                .orElseThrow(() -> new NotFoundException("Absence introuvable"));
        if (!absence.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Cette absence ne vous appartient pas.");
        }
        return map(absence);
    }

    @Transactional(readOnly = true)
    public Absence requireStudentOwned(AppUser student, Long id) {
        Absence absence = absenceRepository.findWithDetailsById(id)
                .orElseThrow(() -> new NotFoundException("Absence introuvable"));
        if (!absence.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Cette absence ne vous appartient pas.");
        }
        return absence;
    }

    @Transactional(readOnly = true)
    public Absence requireTeacherAbsence(AppUser teacher, Long id) {
        Absence absence = absenceRepository.findWithDetailsById(id)
                .orElseThrow(() -> new NotFoundException("Absence introuvable"));
        if (!absence.getSession().getTeacher().getId().equals(teacher.getId())) {
            throw new AccessDeniedException("Cette absence ne relève pas de vos séances.");
        }
        return absence;
    }

    @Transactional(readOnly = true)
    public AbsenceResponse map(Absence absence) {
        return mapper.toAbsence(absence, justificationRepository.findByAbsenceId(absence.getId()).orElse(null));
    }

    private void approvePendingJustification(Justification justification, AppUser teacher, String comment) {
        if (justification != null && justification.getStatus() == JustificationStatus.PENDING) {
            justification.setStatus(JustificationStatus.APPROVED);
            justification.setReviewedBy(teacher);
            justification.setReviewedAt(Instant.now());
            justification.setReviewComment(comment);
            justificationRepository.save(justification);
        }
    }

    private String cleanNote(String note) {
        return note == null || note.isBlank() ? null : note.trim();
    }
}
