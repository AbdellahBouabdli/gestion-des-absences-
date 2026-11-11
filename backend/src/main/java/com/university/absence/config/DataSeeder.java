package com.university.absence.config;

import com.university.absence.domain.Absence;
import com.university.absence.domain.AbsenceStatus;
import com.university.absence.domain.AppUser;
import com.university.absence.domain.Course;
import com.university.absence.domain.CourseSession;
import com.university.absence.domain.Justification;
import com.university.absence.domain.JustificationStatus;
import com.university.absence.domain.Role;
import com.university.absence.domain.StudentGroup;
import com.university.absence.repository.AbsenceRepository;
import com.university.absence.repository.CourseRepository;
import com.university.absence.repository.GroupRepository;
import com.university.absence.repository.JustificationRepository;
import com.university.absence.repository.SessionRepository;
import com.university.absence.repository.UserRepository;
import com.university.absence.service.FileStorageService;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import javax.imageio.ImageIO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final boolean seedDemo;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final CourseRepository courseRepository;
    private final SessionRepository sessionRepository;
    private final AbsenceRepository absenceRepository;
    private final JustificationRepository justificationRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(@Value("${app.seed-demo:false}") boolean seedDemo,
                      UserRepository userRepository,
                      GroupRepository groupRepository,
                      CourseRepository courseRepository,
                      SessionRepository sessionRepository,
                      AbsenceRepository absenceRepository,
                      JustificationRepository justificationRepository,
                      FileStorageService fileStorageService,
                      PasswordEncoder passwordEncoder) {
        this.seedDemo = seedDemo;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.courseRepository = courseRepository;
        this.sessionRepository = sessionRepository;
        this.absenceRepository = absenceRepository;
        this.justificationRepository = justificationRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemo) {
            log.info("Jeu de démonstration désactivé.");
            return;
        }
        if (userRepository.count() > 0) {
            log.info("Base de données déjà initialisée : jeu de démonstration conservé.");
            return;
        }
        log.info("Initialisation du jeu de démonstration Campus Présence...");

        StudentGroup gi1a = group("GI-1A", "1ère année", "Génie Informatique");
        StudentGroup gi1b = group("GI-1B", "1ère année", "Génie Informatique");
        StudentGroup gc2a = group("GC-2A", "2ème année", "Génie Civil");

        AppUser admin = user("Nadia", "Amrani", "admin@univ.ma", "Admin123!", Role.ADMIN, null);
        AppUser hassan = user("Hassan", "El Mansouri", "teacher@univ.ma", "Teacher123!", Role.TEACHER, null);
        AppUser salma = user("Salma", "Benali", "salma@univ.ma", "Teacher123!", Role.TEACHER, null);

        AppUser amine = user("Amine", "El Idrissi", "student@univ.ma", "Student123!", Role.STUDENT, gi1a);
        AppUser sara = user("Sara", "Ait Ali", "sara@univ.ma", "Student123!", Role.STUDENT, gi1a);
        AppUser youssef = user("Youssef", "Bennis", "youssef@univ.ma", "Student123!", Role.STUDENT, gi1a);
        AppUser lina = user("Lina", "Chraibi", "lina@univ.ma", "Student123!", Role.STUDENT, gi1a);
        AppUser mehdi = user("Mehdi", "Alaoui", "mehdi@univ.ma", "Student123!", Role.STUDENT, gi1a);
        AppUser salmaZ = user("Salma", "Zeroual", "salma.z@univ.ma", "Student123!", Role.STUDENT, gi1b);
        AppUser omar = user("Omar", "Belkacem", "omar@univ.ma", "Student123!", Role.STUDENT, gi1b);
        AppUser nour = user("Nour", "Haddad", "nour@univ.ma", "Student123!", Role.STUDENT, gi1b);
        AppUser hamza = user("Hamza", "Tazi", "hamza@univ.ma", "Student123!", Role.STUDENT, gi1b);
        AppUser rania = user("Rania", "Bennani", "rania@univ.ma", "Student123!", Role.STUDENT, gc2a);
        AppUser karim = user("Karim", "Jalal", "karim@univ.ma", "Student123!", Role.STUDENT, gc2a);
        AppUser ines = user("Ines", "Fassi", "ines@univ.ma", "Student123!", Role.STUDENT, gc2a);

        Course dev101 = course("DEV101", "Développement Web", hassan, gi1a);
        Course db101 = course("DB101", "Bases de données", hassan, gi1a);
        Course alg101 = course("ALG101", "Algorithmique", hassan, gi1a);
        Course dev102 = course("DEV102", "Développement Web", hassan, gi1b);
        Course res101 = course("RES101", "Réseaux", hassan, gi1b);
        Course gc201 = course("GC201", "Résistance des matériaux", salma, gc2a);
        Course gc202 = course("GC202", "Topographie", salma, gc2a);
        Course mgt201 = course("MGT201", "Gestion de projet", salma, gc2a);

        LocalDate weekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<CourseSession> sessions = new ArrayList<>();
        sessions.addAll(generateSessions(dev101, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(10, 30), "B12", weekStart));
        sessions.addAll(generateSessions(db101, DayOfWeek.TUESDAY, LocalTime.of(11, 0), LocalTime.of(12, 30), "B08", weekStart));
        sessions.addAll(generateSessions(alg101, DayOfWeek.THURSDAY, LocalTime.of(9, 0), LocalTime.of(10, 30), "A04", weekStart));
        sessions.addAll(generateSessions(dev102, DayOfWeek.MONDAY, LocalTime.of(14, 0), LocalTime.of(15, 30), "B12", weekStart));
        sessions.addAll(generateSessions(res101, DayOfWeek.WEDNESDAY, LocalTime.of(10, 0), LocalTime.of(11, 30), "C03", weekStart));
        sessions.addAll(generateSessions(gc201, DayOfWeek.TUESDAY, LocalTime.of(9, 0), LocalTime.of(10, 30), "D01", weekStart));
        sessions.addAll(generateSessions(gc202, DayOfWeek.WEDNESDAY, LocalTime.of(14, 0), LocalTime.of(15, 30), "D05", weekStart));
        sessions.addAll(generateSessions(mgt201, DayOfWeek.THURSDAY, LocalTime.of(11, 0), LocalTime.of(12, 30), "A12", weekStart));

        List<Absence> absences = generateAbsences(sessions);
        seedJustifications(absences, hassan, amine);

        log.info("Démo prête : {} étudiants, {} séances, {} absences. Comptes : admin@univ.ma / teacher@univ.ma / student@univ.ma",
                userRepository.countByRole(Role.STUDENT), sessions.size(), absences.size());
    }

    private StudentGroup group(String name, String level, String department) {
        StudentGroup group = new StudentGroup();
        group.setName(name);
        group.setLevel(level);
        group.setDepartment(department);
        return groupRepository.save(group);
    }

    private AppUser user(String firstName, String lastName, String email, String password, Role role, StudentGroup group) {
        AppUser user = new AppUser();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setGroup(group);
        user.setActive(true);
        return userRepository.save(user);
    }

    private Course course(String code, String name, AppUser teacher, StudentGroup group) {
        Course course = new Course();
        course.setCode(code);
        course.setName(name);
        course.setTeacher(teacher);
        course.setGroup(group);
        return courseRepository.save(course);
    }

    private List<CourseSession> generateSessions(Course course, DayOfWeek day, LocalTime start, LocalTime end,
                                                 String room, LocalDate weekStart) {
        List<CourseSession> sessions = new ArrayList<>();
        for (int offset = -8; offset <= 2; offset++) {
            LocalDate date = weekStart.plusWeeks(offset).plusDays(
                    day.getValue() - DayOfWeek.MONDAY.getValue());
            CourseSession session = new CourseSession();
            session.setCourse(course);
            session.setGroup(course.getGroup());
            session.setTeacher(course.getTeacher());
            session.setDate(date);
            session.setStartTime(start);
            session.setEndTime(end);
            session.setRoom(room);
            sessions.add(sessionRepository.save(session));
        }
        return sessions;
    }

    private List<Absence> generateAbsences(List<CourseSession> sessions) {
        Random random = new Random(20261107L);
        List<Absence> absences = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (CourseSession session : sessions) {
            if (session.getDate().isAfter(today) || session.getDate().isEqual(today)) {
                continue;
            }
            List<AppUser> students = userRepository.findByRoleAndGroupIdOrderByLastNameAscFirstNameAsc(
                    Role.STUDENT, session.getGroup().getId());
            for (AppUser student : students) {
                double probability = "student@univ.ma".equalsIgnoreCase(student.getEmail()) ? 0.24 : 0.075;
                if (random.nextDouble() >= probability) {
                    continue;
                }
                Absence absence = new Absence();
                absence.setStudent(student);
                absence.setSession(session);
                absence.setStatus(AbsenceStatus.ABSENT);
                absence.setRecordedBy(session.getTeacher());
                if (random.nextBoolean()) {
                    absence.setNote("Absence relevée en début de séance.");
                }
                absences.add(absenceRepository.save(absence));
            }
        }
        return absences;
    }

    private void seedJustifications(List<Absence> absences, AppUser teacher, AppUser demoStudent) {
        List<Absence> candidates = absences.stream()
                .filter(absence -> absence.getSession().getTeacher().getId().equals(teacher.getId()))
                .sorted(Comparator
                        .comparing((Absence absence) -> !absence.getStudent().getId().equals(demoStudent.getId()))
                        .thenComparing(absence -> absence.getSession().getDate()))
                .limit(7)
                .toList();

        String[] reasons = {
                "Certificat médical pour une consultation à l'hôpital.",
                "Convocation administrative à la préfecture.",
                "Rendez-vous médical spécialisé.",
                "Panne de transport dûment justifiée par la société de bus.",
                "Raison familiale urgente.",
                "Certificat de maladie transmis par le médecin traitant.",
                "Participation à une compétition universitaire."
        };
        JustificationStatus[] statuses = {
                JustificationStatus.PENDING,
                JustificationStatus.PENDING,
                JustificationStatus.APPROVED,
                JustificationStatus.REJECTED,
                JustificationStatus.APPROVED,
                JustificationStatus.PENDING,
                JustificationStatus.APPROVED
        };

        for (int i = 0; i < candidates.size(); i++) {
            Absence absence = candidates.get(i);
            Justification justification = new Justification();
            justification.setAbsence(absence);
            justification.setReason(reasons[i % reasons.length]);
            justification.setStatus(statuses[i % statuses.length]);
            justification.setSubmittedAt(Instant.now().minusSeconds(86400L * (i + 1)));
            try {
                byte[] image = placeholderJustification(i + 1);
                FileStorageService.StoredFile stored = fileStorageService.storeGenerated(
                        image, "justificatif-" + absence.getId() + ".png", "image/png");
                justification.setOriginalFileName(stored.originalName());
                justification.setStorageKey(stored.key());
                justification.setContentType(stored.contentType());
                justification.setFileSize(stored.size());
            } catch (IOException ex) {
                log.warn("Impossible de générer le justificatif de démonstration", ex);
            }
            if (justification.getStatus() == JustificationStatus.APPROVED) {
                justification.setReviewedBy(teacher);
                justification.setReviewedAt(Instant.now().minusSeconds(3600));
                justification.setReviewComment("Justificatif vérifié et accepté.");
                absence.setStatus(AbsenceStatus.JUSTIFIED);
            } else if (justification.getStatus() == JustificationStatus.REJECTED) {
                justification.setReviewedBy(teacher);
                justification.setReviewedAt(Instant.now().minusSeconds(7200));
                justification.setReviewComment("Le document fourni ne couvre pas la date de l'absence.");
                absence.setStatus(AbsenceStatus.ABSENT);
            }
            justificationRepository.save(justification);
            absenceRepository.save(absence);
        }
    }

    private byte[] placeholderJustification(int index) throws IOException {
        BufferedImage image = new BufferedImage(720, 480, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setColor(new Color(244, 247, 251));
            graphics.fillRect(0, 0, 720, 480);
            graphics.setColor(new Color(18, 38, 58));
            graphics.fillRect(0, 0, 720, 104);
            graphics.setColor(Color.WHITE);
            graphics.setFont(new Font("SansSerif", Font.BOLD, 26));
            graphics.drawString("CAMPUS PRÉSENCE", 36, 48);
            graphics.setFont(new Font("SansSerif", Font.PLAIN, 16));
            graphics.drawString("Document de démonstration", 36, 78);
            graphics.setColor(new Color(20, 33, 48));
            graphics.setFont(new Font("SansSerif", Font.BOLD, 24));
            graphics.drawString("JUSTIFICATIF D'ABSENCE", 36, 168);
            graphics.setFont(new Font("SansSerif", Font.PLAIN, 17));
            graphics.setColor(new Color(70, 85, 100));
            graphics.drawString("Référence : DEMO-JUST-" + String.format("%03d", index), 36, 208);
            graphics.drawString("Ce document atteste de la justification déposée.", 36, 244);
            graphics.drawString("Il est généré automatiquement pour la démonstration.", 36, 270);
            graphics.setColor(new Color(15, 157, 138));
            graphics.fillRoundRect(36, 324, 250, 52, 12, 12);
            graphics.setColor(Color.WHITE);
            graphics.setFont(new Font("SansSerif", Font.BOLD, 17));
            graphics.drawString("DOCUMENT VÉRIFIÉ", 66, 356);
            graphics.setColor(new Color(190, 200, 210));
            graphics.drawLine(36, 430, 684, 430);
            graphics.setFont(new Font("SansSerif", Font.PLAIN, 13));
            graphics.drawString("Campus Présence · Gestion des absences universitaires", 36, 452);
        } finally {
            graphics.dispose();
        }
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }
}
