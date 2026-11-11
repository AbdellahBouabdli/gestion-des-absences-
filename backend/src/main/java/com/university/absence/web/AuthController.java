package com.university.absence.web;

import com.university.absence.dto.AuthDtos.LoginRequest;
import com.university.absence.dto.AuthDtos.LoginResponse;
import com.university.absence.dto.AuthDtos.UserResponse;
import com.university.absence.security.CurrentUser;
import com.university.absence.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "Connexion et profil de l'utilisateur connecté")
public class AuthController {

    private final AuthService authService;
    private final CurrentUser currentUser;

    public AuthController(AuthService authService, CurrentUser currentUser) {
        this.authService = authService;
        this.currentUser = currentUser;
    }

    @PostMapping("/login")
    @Operation(summary = "Se connecter et obtenir un jeton JWT")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Récupérer le profil connecté")
    public UserResponse me() {
        return authService.me(currentUser.get());
    }
}
