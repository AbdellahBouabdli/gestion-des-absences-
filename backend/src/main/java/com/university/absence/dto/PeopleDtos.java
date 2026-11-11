package com.university.absence.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class PeopleDtos {

    private PeopleDtos() {
    }

    public record StudentRequest(
            @NotBlank(message = "Le prénom est obligatoire")
            @Size(max = 80)
            String firstName,

            @NotBlank(message = "Le nom est obligatoire")
            @Size(max = 80)
            String lastName,

            @NotBlank(message = "L'email est obligatoire")
            @Email(message = "Format d'email invalide")
            @Size(max = 160)
            String email,

            @Size(min = 8, max = 120, message = "Le mot de passe doit contenir au moins 8 caractères")
            String password,

            @NotNull(message = "Le groupe est obligatoire")
            Long groupId
    ) {
    }

    public record TeacherRequest(
            @NotBlank(message = "Le prénom est obligatoire")
            @Size(max = 80)
            String firstName,

            @NotBlank(message = "Le nom est obligatoire")
            @Size(max = 80)
            String lastName,

            @NotBlank(message = "L'email est obligatoire")
            @Email(message = "Format d'email invalide")
            @Size(max = 160)
            String email,

            @Size(min = 8, max = 120, message = "Le mot de passe doit contenir au moins 8 caractères")
            String password
    ) {
    }

    public record StudentResponse(
            Long id,
            String firstName,
            String lastName,
            String fullName,
            String email,
            Long groupId,
            String groupName,
            long absences,
            long justifiedAbsences,
            double absenceRate
    ) {
    }

    public record TeacherResponse(
            Long id,
            String firstName,
            String lastName,
            String fullName,
            String email,
            long courses,
            long groups
    ) {
    }
}
