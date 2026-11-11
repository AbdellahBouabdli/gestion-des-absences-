package com.university.absence.dto;

import com.university.absence.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "L'email est obligatoire")
            @Email(message = "Format d'email invalide")
            String email,

            @NotBlank(message = "Le mot de passe est obligatoire")
            String password
    ) {
    }

    public record LoginResponse(
            String token,
            String tokenType,
            long expiresIn,
            UserResponse user
    ) {
    }

    public record UserResponse(
            Long id,
            String firstName,
            String lastName,
            String fullName,
            String email,
            Role role,
            Long groupId,
            String groupName
    ) {
    }
}
