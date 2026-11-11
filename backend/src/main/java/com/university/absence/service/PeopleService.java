package com.university.absence.service;

import com.university.absence.domain.AppUser;
import com.university.absence.domain.Role;
import com.university.absence.domain.StudentGroup;
import com.university.absence.dto.PeopleDtos.StudentRequest;
import com.university.absence.dto.PeopleDtos.StudentResponse;
import com.university.absence.dto.PeopleDtos.TeacherRequest;
import com.university.absence.dto.PeopleDtos.TeacherResponse;
import com.university.absence.exception.BadRequestException;
import com.university.absence.exception.ConflictException;
import com.university.absence.exception.NotFoundException;
import com.university.absence.repository.AbsenceRepository;
import com.university.absence.repository.CourseRepository;
import com.university.absence.repository.GroupRepository;
import com.university.absence.repository.SessionRepository;
import com.university.absence.repository.UserRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PeopleService {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final CourseRepository courseRepository;
    private final SessionRepository sessionRepository;
    private final AbsenceRepository absenceRepository;
    private final TeacherAccess teacherAccess;
    private final PasswordEncoder passwordEncoder;
    private final DtoMapper mapper;

    public PeopleService(UserRepository userRepository, GroupRepository groupRepository,
                         CourseRepository courseRepository, SessionRepository sessionRepository,
                         AbsenceRepository absenceRepository, TeacherAccess teacherAccess,
                         PasswordEncoder passwordEncoder, DtoMapper mapper) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.courseRepository = courseRepository;
        this.sessionRepository = sessionRepository;
        this.absenceRepository = absenceRepository;
        this.teacherAccess = teacherAccess;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> listStudents(String search, Long groupId) {
        List<AppUser> students = userRepository.search(Role.STUDENT, groupId, normalizeSearch(search));
        return mapStudents(students);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> listStudentsForTeacher(AppUser teacher, String search, Long groupId) {
        if (groupId != null) {
            teacherAccess.requireGroup(teacher.getId(), groupId);
            return mapStudents(userRepository.findByRoleAndGroupIdOrderByLastNameAscFirstNameAsc(Role.STUDENT, groupId))
                    .stream().filter(student -> matches(student, search)).toList();
        }

        Map<Long, AppUser> unique = new LinkedHashMap<>();
        groupRepository.findAllByOrderByNameAsc().stream()
                .filter(group -> teacherAccess.teachesGroup(teacher.getId(), group.getId()))
                .forEach(group -> userRepository
                        .findByRoleAndGroupIdOrderByLastNameAscFirstNameAsc(Role.STUDENT, group.getId())
                        .forEach(student -> unique.put(student.getId(), student)));
        List<StudentResponse> mapped = mapStudents(new ArrayList<>(unique.values()));
        return mapped.stream().filter(student -> matches(student, search)).toList();
    }

    private List<StudentResponse> mapStudents(List<AppUser> students) {
        Map<Long, Long> sessionsPerGroup = new HashMap<>();
        return students.stream()
                .sorted(Comparator.comparing(AppUser::getLastName).thenComparing(AppUser::getFirstName))
                .map(student -> {
                    long absences = absenceRepository.countByStudentId(student.getId());
                    long justified = absenceRepository.countByStudentIdAndStatus(
                            student.getId(), com.university.absence.domain.AbsenceStatus.JUSTIFIED);
                    long sessions = 0;
                    if (student.getGroup() != null) {
                        sessions = sessionsPerGroup.computeIfAbsent(student.getGroup().getId(),
                                groupId -> sessionRepository.countByGroupIdAndDateLessThanEqual(groupId, LocalDate.now()));
                    }
                    return mapper.toStudent(student, absences, justified, sessions);
                })
                .toList();
    }

    private boolean matches(StudentResponse student, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String needle = search.trim().toLowerCase(Locale.ROOT);
        return student.fullName().toLowerCase(Locale.ROOT).contains(needle)
                || student.email().toLowerCase(Locale.ROOT).contains(needle);
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest request) {
        requirePassword(request.password());
        String email = normalizedEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Un compte avec cet email existe déjà.");
        }
        StudentGroup group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> new NotFoundException("Groupe introuvable"));
        AppUser student = new AppUser();
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setEmail(email);
        student.setPasswordHash(passwordEncoder.encode(request.password()));
        student.setRole(Role.STUDENT);
        student.setGroup(group);
        student.setActive(true);
        AppUser saved = userRepository.save(student);
        long sessions = sessionRepository.countByGroupIdAndDateLessThanEqual(group.getId(), LocalDate.now());
        return mapper.toStudent(saved, 0, 0, sessions);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        AppUser student = findStudent(id);
        String email = normalizedEmail(request.email());
        if (!student.getEmail().equalsIgnoreCase(email) && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Un compte avec cet email existe déjà.");
        }
        StudentGroup group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> new NotFoundException("Groupe introuvable"));
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setEmail(email);
        student.setGroup(group);
        if (request.password() != null && !request.password().isBlank()) {
            requirePassword(request.password());
            student.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        userRepository.save(student);
        long absences = absenceRepository.countByStudentId(id);
        long justified = absenceRepository.countByStudentIdAndStatus(
                id, com.university.absence.domain.AbsenceStatus.JUSTIFIED);
        long sessions = sessionRepository.countByGroupIdAndDateLessThanEqual(group.getId(), LocalDate.now());
        return mapper.toStudent(student, absences, justified, sessions);
    }

    @Transactional(readOnly = true)
    public AppUser findStudent(Long id) {
        AppUser user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Étudiant introuvable"));
        if (user.getRole() != Role.STUDENT) {
            throw new NotFoundException("Étudiant introuvable");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public List<TeacherResponse> listTeachers() {
        return userRepository.findByRoleOrderByLastNameAscFirstNameAsc(Role.TEACHER).stream()
                .map(teacher -> {
                    var courses = courseRepository.findByTeacherIdOrderByNameAsc(teacher.getId());
                    long groups = courses.stream().map(course -> course.getGroup().getId()).distinct().count();
                    return mapper.toTeacher(teacher, courses.size(), groups);
                })
                .toList();
    }

    @Transactional
    public TeacherResponse createTeacher(TeacherRequest request) {
        requirePassword(request.password());
        String email = normalizedEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Un compte avec cet email existe déjà.");
        }
        AppUser teacher = new AppUser();
        teacher.setFirstName(request.firstName().trim());
        teacher.setLastName(request.lastName().trim());
        teacher.setEmail(email);
        teacher.setPasswordHash(passwordEncoder.encode(request.password()));
        teacher.setRole(Role.TEACHER);
        teacher.setActive(true);
        AppUser saved = userRepository.save(teacher);
        return mapper.toTeacher(saved, 0, 0);
    }

    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherRequest request) {
        AppUser teacher = findTeacher(id);
        String email = normalizedEmail(request.email());
        if (!teacher.getEmail().equalsIgnoreCase(email) && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Un compte avec cet email existe déjà.");
        }
        teacher.setFirstName(request.firstName().trim());
        teacher.setLastName(request.lastName().trim());
        teacher.setEmail(email);
        if (request.password() != null && !request.password().isBlank()) {
            requirePassword(request.password());
            teacher.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        userRepository.save(teacher);
        var courses = courseRepository.findByTeacherIdOrderByNameAsc(id);
        long groups = courses.stream().map(course -> course.getGroup().getId()).distinct().count();
        return mapper.toTeacher(teacher, courses.size(), groups);
    }

    @Transactional(readOnly = true)
    public AppUser findTeacher(Long id) {
        AppUser user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Enseignant introuvable"));
        if (user.getRole() != Role.TEACHER) {
            throw new NotFoundException("Enseignant introuvable");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> topStudents(int limit) {
        List<AppUser> students = userRepository.findByRoleOrderByLastNameAscFirstNameAsc(Role.STUDENT);
        return mapStudents(students).stream()
                .sorted(Comparator.comparingLong(StudentResponse::absences).reversed()
                        .thenComparing(StudentResponse::fullName))
                .limit(limit)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentForAdmin(Long id) {
        return mapStudents(List.of(findStudent(id))).getFirst();
    }

    private void requirePassword(String password) {
        if (password == null || password.isBlank() || password.length() < 8) {
            throw new BadRequestException("Le mot de passe doit contenir au moins 8 caractères.");
        }
    }

    private String normalizedEmail(String email) {
        return Objects.requireNonNull(email).trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }
}
