package com.university.absence.web;

import com.university.absence.dto.AbsenceDtos.AbsenceResponse;
import com.university.absence.dto.AbsenceDtos.JustificationResponse;
import com.university.absence.dto.AcademicDtos.SessionResponse;
import com.university.absence.dto.StatsDtos.StudentDashboard;
import com.university.absence.security.CurrentUser;
import com.university.absence.service.AbsenceService;
import com.university.absence.service.JustificationService;
import com.university.absence.service.ScheduleService;
import com.university.absence.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/student")
@Tag(name = "Étudiant", description = "Consultation des absences et dépôt de justificatifs")
public class StudentController {

    private final CurrentUser currentUser;
    private final ScheduleService scheduleService;
    private final AbsenceService absenceService;
    private final JustificationService justificationService;
    private final StatsService statsService;

    public StudentController(CurrentUser currentUser, ScheduleService scheduleService,
                             AbsenceService absenceService, JustificationService justificationService,
                             StatsService statsService) {
        this.currentUser = currentUser;
        this.scheduleService = scheduleService;
        this.absenceService = absenceService;
        this.justificationService = justificationService;
        this.statsService = statsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Tableau de bord de l'étudiant")
    public StudentDashboard dashboard() {
        return statsService.studentDashboard(currentUser.requireStudent());
    }

    @GetMapping("/schedule")
    @Operation(summary = "Consulter son emploi du temps")
    public List<SessionResponse> schedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return scheduleService.studentSchedule(currentUser.requireStudent(), from, to);
    }

    @GetMapping("/absences")
    @Operation(summary = "Consulter ses absences")
    public List<AbsenceResponse> absences() {
        return absenceService.studentAbsences(currentUser.requireStudent());
    }

    @GetMapping("/absences/{id}")
    @Operation(summary = "Consulter les détails d'une absence")
    public AbsenceResponse absence(@PathVariable Long id) {
        return absenceService.studentAbsence(currentUser.requireStudent(), id);
    }

    @GetMapping("/justifications")
    @Operation(summary = "Consulter le statut de ses justificatifs")
    public List<JustificationResponse> justifications() {
        return justificationService.listForStudent(currentUser.requireStudent());
    }

    @PostMapping(value = "/absences/{id}/justification", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Déposer un justificatif")
    public JustificationResponse submitJustification(@PathVariable Long id,
                                                     @RequestParam String reason,
                                                     @RequestParam MultipartFile file) {
        return justificationService.submit(currentUser.requireStudent(), id, reason, file);
    }
}
