package com.university.absence.security;

import com.university.absence.domain.AppUser;
import com.university.absence.exception.NotFoundException;
import com.university.absence.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    private final UserRepository userRepository;

    public CurrentUser(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUser get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new NotFoundException("Utilisateur non authentifié");
        }
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new NotFoundException("Utilisateur introuvable"));
    }

    public AppUser requireTeacher() {
        AppUser user = get();
        if (user.getRole() != com.university.absence.domain.Role.TEACHER) {
            throw new org.springframework.security.access.AccessDeniedException("Réservé aux enseignants");
        }
        return user;
    }

    public AppUser requireStudent() {
        AppUser user = get();
        if (user.getRole() != com.university.absence.domain.Role.STUDENT) {
            throw new org.springframework.security.access.AccessDeniedException("Réservé aux étudiants");
        }
        return user;
    }
}
