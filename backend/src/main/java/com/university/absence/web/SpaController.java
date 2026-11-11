package com.university.absence.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Serves the React single-page application for client-side routes.
 * API routes are handled by their respective controllers.
 */
@Controller
public class SpaController {

    @GetMapping({
            "/",
            "/login",
            "/teacher",
            "/teacher/**",
            "/student",
            "/student/**",
            "/admin",
            "/admin/**"
    })
    public String forwardToApp() {
        return "forward:/index.html";
    }
}
