package com.university.absence.service;

import com.university.absence.domain.AppUser;
import com.university.absence.dto.AuthDtos.LoginRequest;
import com.university.absence.dto.AuthDtos.LoginResponse;
import com.university.absence.dto.AuthDtos.UserResponse;
import com.university.absence.exception.UnauthorizedException;
import com.university.absence.repository.UserRepository;
import com.university.absence.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final DtoMapper mapper;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       JwtService jwtService, DtoMapper mapper) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim(), request.password()));
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Email ou mot de passe incorrect.");
        }
        AppUser user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Email ou mot de passe incorrect."));
        return new LoginResponse(
                jwtService.generateToken(user),
                "Bearer",
                jwtService.getExpirationSeconds(),
                mapper.toUser(user)
        );
    }

    @Transactional(readOnly = true)
    public UserResponse me(AppUser user) {
        return mapper.toUser(user);
    }
}
