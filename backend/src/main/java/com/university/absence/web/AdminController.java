package com.university.absence.web;

import com.university.absence.dto.AcademicDtos.GroupRequest;
import com.university.absence.dto.AcademicDtos.GroupResponse;
import com.university.absence.dto.AbsenceDtos.MessageResponse;
import com.university.absence.dto.PeopleDtos.StudentRequest;
import com.university.absence.dto.PeopleDtos.StudentResponse;
import com.university.absence.dto.PeopleDtos.TeacherRequest;
import com.university.absence.dto.PeopleDtos.TeacherResponse;
import com.university.absence.dto.StatsDtos.AdminDashboard;
import com.university.absence.service.GroupService;
import com.university.absence.service.PeopleService;
import com.university.absence.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administration", description = "Gestion des étudiants, enseignants et groupes")
public class AdminController {

    private final PeopleService peopleService;
    private final GroupService groupService;
    private final StatsService statsService;

    public AdminController(PeopleService peopleService, GroupService groupService, StatsService statsService) {
        this.peopleService = peopleService;
        this.groupService = groupService;
        this.statsService = statsService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Statistiques globales de l'université")
    public AdminDashboard dashboard() {
        return statsService.adminDashboard();
    }

    @GetMapping("/students")
    @Operation(summary = "Lister ou rechercher les étudiants")
    public List<StudentResponse> students(@RequestParam(required = false) String search,
                                          @RequestParam(required = false) Long groupId) {
        return peopleService.listStudents(search, groupId);
    }

    @GetMapping("/students/{id}")
    @Operation(summary = "Consulter un étudiant")
    public StudentResponse student(@PathVariable Long id) {
        return peopleService.getStudentForAdmin(id);
    }

    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ajouter un étudiant")
    public StudentResponse createStudent(@Valid @RequestBody StudentRequest request) {
        return peopleService.createStudent(request);
    }

    @PutMapping("/students/{id}")
    @Operation(summary = "Modifier les informations d'un étudiant")
    public StudentResponse updateStudent(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return peopleService.updateStudent(id, request);
    }

    @GetMapping("/teachers")
    @Operation(summary = "Lister les enseignants")
    public List<TeacherResponse> teachers() {
        return peopleService.listTeachers();
    }

    @PostMapping("/teachers")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ajouter un enseignant")
    public TeacherResponse createTeacher(@Valid @RequestBody TeacherRequest request) {
        return peopleService.createTeacher(request);
    }

    @PutMapping("/teachers/{id}")
    @Operation(summary = "Modifier un enseignant")
    public TeacherResponse updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherRequest request) {
        return peopleService.updateTeacher(id, request);
    }

    @GetMapping("/groups")
    @Operation(summary = "Lister les groupes")
    public List<GroupResponse> groups() {
        return groupService.listAll();
    }

    @PostMapping("/groups")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Ajouter un groupe")
    public GroupResponse createGroup(@Valid @RequestBody GroupRequest request) {
        return groupService.create(request);
    }

    @PutMapping("/groups/{id}")
    @Operation(summary = "Modifier un groupe")
    public GroupResponse updateGroup(@PathVariable Long id, @Valid @RequestBody GroupRequest request) {
        return groupService.update(id, request);
    }

    @DeleteMapping("/groups/{id}")
    @Operation(summary = "Supprimer un groupe vide")
    public MessageResponse deleteGroup(@PathVariable Long id) {
        groupService.delete(id);
        return new MessageResponse("Groupe supprimé.");
    }
}
