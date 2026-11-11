package com.university.absence.service;

import com.university.absence.domain.Absence;
import com.university.absence.domain.AbsenceStatus;
import com.university.absence.domain.AppUser;
import com.university.absence.domain.CourseSession;
import com.university.absence.domain.JustificationStatus;
import com.university.absence.domain.Role;
import com.university.absence.domain.StudentGroup;
import com.university.absence.dto.StatsDtos.AdminDashboard;
import com.university.absence.dto.StatsDtos.CourseStat;
import com.university.absence.dto.StatsDtos.GroupStat;
import com.university.absence.dto.StatsDtos.MetricPoint;
import com.university.absence.dto.StatsDtos.StudentDashboard;
import com.university.absence.dto.StatsDtos.TeacherDashboard;
import com.university.absence.repository.AbsenceRepository;
import com.university.absence.repository.GroupRepository;
import com.university.absence.repository.JustificationRepository;
import com.university.absence.repository.SessionRepository;
import com.university.absence.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsService {

    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd MMM", Locale.FRENCH);
    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("MMM yy", Locale.FRENCH);

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final SessionRepository sessionRepository;
    private final AbsenceRepository absenceRepository;
    private final JustificationRepository justificationRepository;
    private final AbsenceService absenceService;
    private final ScheduleService scheduleService;
    private final PeopleService peopleService;
    private final DtoMapper mapper;

    public StatsService(UserRepository userRepository, GroupRepository groupRepository,
                        SessionRepository sessionRepository, AbsenceRepository absenceRepository,
                        JustificationRepository justificationRepository, AbsenceService absenceService,
                        ScheduleService scheduleService, PeopleService peopleService, DtoMapper mapper) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.sessionRepository = sessionRepository;
        this.absenceRepository = absenceRepository;
        this.justificationRepository = justificationRepository;
        this.absenceService = absenceService;
        this.scheduleService = scheduleService;
        this.peopleService = peopleService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public TeacherDashboard teacherDashboard(AppUser teacher) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);
        LocalDate monthStart = today.withDayOfMonth(1);

        List<StudentGroup> groups = sessionRepository.findDistinctGroupsByTeacherId(teacher.getId());
        long totalStudents = groups.stream()
                .mapToLong(group -> userRepository.countByRoleAndGroupId(Role.STUDENT, group.getId()))
                .sum();
        long sessionsThisWeek = sessionRepository.countByTeacherIdAndDateBetween(teacher.getId(), weekStart, weekEnd);
        long sessionsThisMonth = sessionRepository.countByTeacherIdAndDateBetween(teacher.getId(), monthStart, today);
        long absencesThisMonth = absenceRepository.countBySessionTeacherIdAndSessionDateBetween(
                teacher.getId(), monthStart, today);
        long justifiedThisMonth = absenceRepository.countBySessionTeacherIdAndStatusAndSessionDateBetween(
                teacher.getId(), AbsenceStatus.JUSTIFIED, monthStart, today);
        long pending = justificationRepository.countByAbsenceSessionTeacherIdAndStatus(
                teacher.getId(), JustificationStatus.PENDING);

        List<MetricPoint> weeklyTrend = new ArrayList<>();
        LocalDate trendStart = weekStart.minusWeeks(5);
        for (int i = 0; i < 6; i++) {
            LocalDate start = trendStart.plusWeeks(i);
            LocalDate end = start.plusDays(6);
            weeklyTrend.add(new MetricPoint(label(start, DAY_LABEL), absenceRepository
                    .countBySessionTeacherIdAndSessionDateBetween(teacher.getId(), start, end)));
        }

        List<GroupStat> groupStats = groups.stream().map(this::groupStat).toList();
        List<com.university.absence.dto.AbsenceDtos.AbsenceResponse> recent = absenceRepository
                .findBySessionTeacherIdOrderBySessionDateDescSessionStartTimeDesc(teacher.getId())
                .stream().limit(6).map(absenceService::map).toList();

        return new TeacherDashboard(
                groups.size(),
                totalStudents,
                sessionsThisWeek,
                absencesThisMonth,
                pending,
                mapper.rate(absencesThisMonth, sessionsThisMonth),
                justifiedThisMonth,
                weeklyTrend,
                groupStats,
                recent,
                scheduleService.todayForTeacher(teacher)
        );
    }

    @Transactional(readOnly = true)
    public StudentDashboard studentDashboard(AppUser student) {
        LocalDate today = LocalDate.now();
        if (student.getGroup() == null) {
            return new StudentDashboard(0, 0, 0, 0, 0, List.of(), List.of(), List.of());
        }
        List<CourseSession> sessions = sessionRepository
                .findByGroupIdAndDateLessThanEqualOrderByDateDescStartTimeDesc(
                        student.getGroup().getId(), today);
        List<Absence> absences = absenceRepository
                .findByStudentIdOrderBySessionDateDescSessionStartTimeDesc(student.getId());
        long justified = absences.stream().filter(a -> a.getStatus() == AbsenceStatus.JUSTIFIED).count();
        long pending = justificationRepository.countByAbsenceStudentIdAndStatus(
                student.getId(), JustificationStatus.PENDING);

        Map<Long, CourseAccumulator> courseMap = new LinkedHashMap<>();
        for (CourseSession session : sessions) {
            courseMap.computeIfAbsent(session.getCourse().getId(),
                            id -> new CourseAccumulator(session.getCourse().getName()))
                    .sessions++;
        }
        for (Absence absence : absences) {
            courseMap.computeIfAbsent(absence.getSession().getCourse().getId(),
                            id -> new CourseAccumulator(absence.getSession().getCourse().getName()))
                    .absences++;
        }
        List<CourseStat> courseStats = courseMap.values().stream()
                .map(course -> new CourseStat(course.name, course.absences, course.sessions,
                        mapper.rate(course.absences, course.sessions)))
                .sorted(Comparator.comparing(CourseStat::courseName))
                .toList();

        List<com.university.absence.dto.AbsenceDtos.AbsenceResponse> recent = absences.stream()
                .limit(5).map(absenceService::map).toList();

        return new StudentDashboard(
                sessions.size(),
                absences.size(),
                justified,
                pending,
                mapper.rate(absences.size(), sessions.size()),
                courseStats,
                recent,
                scheduleService.nextForStudent(student, 5)
        );
    }

    @Transactional(readOnly = true)
    public AdminDashboard adminDashboard() {
        LocalDate today = LocalDate.now();
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalTeachers = userRepository.countByRole(Role.TEACHER);
        long totalGroups = groupRepository.count();
        long totalSessions = sessionRepository.countByDateLessThanEqual(today);
        long totalAbsences = absenceRepository.count();
        long pending = justificationRepository.countByStatus(JustificationStatus.PENDING);

        List<GroupStat> groupStats = groupRepository.findAllByOrderByNameAsc().stream()
                .map(this::groupStat).toList();

        List<MetricPoint> monthlyTrend = new ArrayList<>();
        YearMonth current = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            LocalDate start = month.atDay(1);
            LocalDate end = month.atEndOfMonth().isAfter(today) ? today : month.atEndOfMonth();
            monthlyTrend.add(new MetricPoint(label(start, MONTH_LABEL),
                    absenceRepository.countBySessionDateBetween(start, end)));
        }

        List<com.university.absence.dto.AbsenceDtos.AbsenceResponse> recent = absenceRepository
                .findTop8ByOrderBySessionDateDescSessionStartTimeDesc()
                .stream().limit(8).map(absenceService::map).toList();

        return new AdminDashboard(
                totalStudents,
                totalTeachers,
                totalGroups,
                totalSessions,
                totalAbsences,
                pending,
                mapper.rate(totalAbsences, totalSessions),
                groupStats,
                monthlyTrend,
                peopleService.topStudents(5),
                recent
        );
    }

    private GroupStat groupStat(StudentGroup group) {
        LocalDate today = LocalDate.now();
        long students = userRepository.countByRoleAndGroupId(Role.STUDENT, group.getId());
        long absences = absenceRepository.countBySessionGroupIdAndSessionDateBetween(
                group.getId(), LocalDate.of(2000, 1, 1), today);
        long sessions = sessionRepository.countByGroupIdAndDateLessThanEqual(group.getId(), today);
        return new GroupStat(group.getId(), group.getName(), students, absences, sessions,
                mapper.rate(absences, sessions));
    }

    private String label(LocalDate date, DateTimeFormatter formatter) {
        String value = formatter.format(date);
        return value.isEmpty() ? value : value.substring(0, 1).toUpperCase(Locale.FRENCH) + value.substring(1);
    }

    private static final class CourseAccumulator {
        private final String name;
        private long absences;
        private long sessions;

        private CourseAccumulator(String name) {
            this.name = name;
        }
    }
}
