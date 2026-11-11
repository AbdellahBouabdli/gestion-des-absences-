package com.university.absence.dto;

import com.university.absence.domain.AbsenceStatus;
import com.university.absence.domain.JustificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public final class AbsenceDtos {

    private AbsenceDtos() {
    }

    public record CreateAbsenceRequest(
            @NotNull(message = "L'étudiant est obligatoire")
            Long studentId,

            @NotNull(message = "La séance est obligatoire")
            Long sessionId,

            @Size(max = 1000, message = "La note ne peut pas dépasser 1000 caractères")
            String note
    ) {
    }

    public record UpdateAbsenceRequest(
            @Size(max = 1000, message = "La note ne peut pas dépasser 1000 caractères")
            String note,

            @NotNull(message = "Le statut est obligatoire")
            AbsenceStatus status
    ) {
    }

    public record JustifyAbsenceRequest(
            @NotBlank(message = "Le motif est obligatoire")
            @Size(max = 1000)
            String reason
    ) {
    }

    public record ReviewJustificationRequest(
            @NotNull(message = "Le statut est obligatoire")
            JustificationStatus status,

            @Size(max = 1000, message = "Le commentaire ne peut pas dépasser 1000 caractères")
            String comment
    ) {
    }

    public record AbsenceResponse(
            Long id,
            Long studentId,
            String studentName,
            Long groupId,
            String groupName,
            Long sessionId,
            String courseCode,
            String courseName,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String room,
            AbsenceStatus status,
            String note,
            String recordedByName,
            Instant recordedAt,
            Long justificationId,
            JustificationStatus justificationStatus
    ) {
    }

    public record JustificationResponse(
            Long id,
            Long absenceId,
            Long studentId,
            String studentName,
            String groupName,
            String courseName,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String reason,
            String fileName,
            Long fileSize,
            JustificationStatus status,
            Instant submittedAt,
            String reviewedByName,
            Instant reviewedAt,
            String reviewComment,
            String downloadUrl
    ) {
    }

    public record MessageResponse(String message) {
    }
}
