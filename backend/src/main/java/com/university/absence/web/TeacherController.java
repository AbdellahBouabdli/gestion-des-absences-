package com.university.absence.web;

import com.university.absence.domain.AppUser;
import com.university.absence.domain.JustificationStatus;
import com.university.absence.dto.AbsenceDtos.AbsenceResponse;
import com.university.absence.dto.AbsenceDtos.CreateAbsenceRequest;
import com.university.absence.dto.AbsenceDtos.JustificationResponse;
import com.university.absence.dto.AbsenceDtos.MessageResponse;
import com.university.absence.dto.AbsenceDtos.ReviewJustificationRequest;
import com.university.absence.dto.AbsenceDtos.UpdateAbsenceRequest;
import com.university.absence.dto.AcademicDtos.GroupResponse;
import com.university.absence.dto.AcademicDtos.SessionResponse;
import com.university.absence.dto.PeopleDtos.StudentResponse;
import com.university.absence.dto.StatsDtos.TeacherDashboard;
import com.university.absence.security.CurrentUser;
import com.university.absence.service.AbsenceService;
import com.university.absence.service.GroupService;
import com.university.absence.service.JustificationService;
import com.university.absence.service.PeopleService;
import com.university.absence.service.ScheduleService;
import com.university.absence.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher")
@Tag(name = "Enseignant", description = "Gestion des absences et justificatifs par l'enseignant")
public class TeacherController {

    private final CurrentUser currentUser;
    private final GroupService groupService;
    private final PeopleService peopleService;
    private final ScheduleService scheduleService;
    private final AbsenceService absenceService;
    private final JustificationService justificationService;
    private final StatsService statsService;

    public TeacherController(CurrentUser currentUser, GroupService groupService, PeopleService peopleService,
                             ScheduleService scheduleService, AbsenceService absenceService,
                             JustificationService justificationService, StatsService statsService) {
        this.currentUser = currentUser;
        this.groupService = groupService;
        this.peopleService = peopleService;
        this.scheduleService = scheduleService;
        this.absenceService = absenceService;
        this.justificationService = justificationService;
        this.statsService = statsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Tableau de bord de l'enseignant")
    public TeacherDashboard dashboard() {
        return statsService.teacherDashboard(currentUser.requireTeacher());
    }

    @GetMapping("/groups")
    @Operation(summary = "Lister les groupes de l'enseignant")
    public List<GroupResponse> groups() {
        return groupService.listForTeacher(currentUser.requireTeacher());
    }

    @GetMapping("/students")
    @Operation(summary = "Lister les étudiants, avec taux d'absence")
    public List<StudentResponse> students(@RequestParam(required = false) Long groupId,
                                          @RequestParam(required = false) String search) {
        return peopleService.listStudentsForTeacher(currentUser.requireTeacher(), search, groupId);
    }

    @GetMapping("/schedule")
    @Operation(summary = "Consulter l'emploi du temps de l'enseignant")
    public List<SessionResponse> schedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return scheduleService.teacherSchedule(currentUser.requireTeacher(), from, to);
    }

    @GetMapping("/absences")
    @Operation(summary = "Consulter l'historique des absences")
    public List<AbsenceResponse> absences(
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return absenceService.teacherAbsences(currentUser.requireTeacher(), groupId, studentId, from, to);
    }

    @PostMapping("/absences")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Enregistrer une absence")
    public AbsenceResponse createAbsence(@Valid @RequestBody CreateAbsenceRequest request) {
        return absenceService.create(currentUser.requireTeacher(), request);
    }

    @PutMapping("/absences/{id}")
    @Operation(summary = "Modifier une absence")
    public AbsenceResponse updateAbsence(@PathVariable Long id, @Valid @RequestBody UpdateAbsenceRequest request) {
        return absenceService.update(currentUser.requireTeacher(), id, request);
    }

    @PostMapping("/absences/{id}/justify")
    @Operation(summary = "Justifier directement une absence")
    public AbsenceResponse justifyAbsence(@PathVariable Long id) {
        return absenceService.justify(currentUser.requireTeacher(), id);
    }

    @DeleteMapping("/absences/{id}")
    @Operation(summary = "Supprimer une absence")
    public MessageResponse deleteAbsence(@PathVariable Long id) {
        absenceService.delete(currentUser.requireTeacher(), id);
        return new MessageResponse("Absence supprimée.");
    }

    @GetMapping("/justifications")
    @Operation(summary = "Consulter les justificatifs des séances de l'enseignant")
    public List<JustificationResponse> justifications(@RequestParam(required = false) JustificationStatus status) {
        AppUser teacher = currentUser.requireTeacher();
        return justificationService.listForTeacher(teacher, status);
    }

    @PatchMapping("/justifications/{id}")
    @Operation(summary = "Approuver ou refuser un justificatif")
    public JustificationResponse reviewJustification(@PathVariable Long id,
                                                     @Valid @RequestBody ReviewJustificationRequest request) {
        return justificationService.review(currentUser.requireTeacher(), id, request);
    }
}
