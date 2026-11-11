package com.university.absence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.absence.domain.AppUser;
import com.university.absence.domain.Course;
import com.university.absence.domain.CourseSession;
import com.university.absence.domain.Role;
import com.university.absence.domain.StudentGroup;
import com.university.absence.repository.AbsenceRepository;
import com.university.absence.repository.CourseRepository;
import com.university.absence.repository.GroupRepository;
import com.university.absence.repository.JustificationRepository;
import com.university.absence.repository.SessionRepository;
import com.university.absence.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CampusPresenceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private SessionRepository sessionRepository;
    @Autowired
    private AbsenceRepository absenceRepository;
    @Autowired
    private JustificationRepository justificationRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private AppUser teacher;
    private AppUser student;
    private CourseSession session;

    @BeforeEach
    void setUp() {
        justificationRepository.deleteAll();
        absenceRepository.deleteAll();
        sessionRepository.deleteAll();
        courseRepository.deleteAll();
        userRepository.deleteAll();
        groupRepository.deleteAll();

        StudentGroup group = new StudentGroup();
        group.setName("GI-TEST");
        group.setLevel("1ère année");
        group.setDepartment("Informatique");
        group = groupRepository.save(group);

        teacher = user("Hassan", "Test", "teacher.test@univ.ma", Role.TEACHER, null, "Teacher123!");
        student = user("Amine", "Test", "student.test@univ.ma", Role.STUDENT, group, "Student123!");

        Course course = new Course();
        course.setCode("TEST101");
        course.setName("Architecture logicielle");
        course.setTeacher(teacher);
        course.setGroup(group);
        course = courseRepository.save(course);

        session = new CourseSession();
        session.setCourse(course);
        session.setGroup(group);
        session.setTeacher(teacher);
        session.setDate(LocalDate.now().minusDays(1));
        session.setStartTime(LocalTime.of(9, 0));
        session.setEndTime(LocalTime.of(10, 30));
        session.setRoom("T01");
        session = sessionRepository.save(session);
    }

    @Test
    void loginReturnsJwtAndProfileRefreshWorks() throws Exception {
        String token = login("teacher.test@univ.ma", "Teacher123!");

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Hassan Test"))
                .andExpect(jsonPath("$.role").value("TEACHER"));
    }

    @Test
    void teacherCanRecordAbsenceAndStudentCanReadIt() throws Exception {
        String teacherToken = login("teacher.test@univ.ma", "Teacher123!");
        String body = objectMapper.writeValueAsString(Map.of(
                "studentId", student.getId(),
                "sessionId", session.getId(),
                "note", "Absence constatée en cours"
        ));

        mockMvc.perform(post("/api/teacher/absences")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentName").value("Amine Test"))
                .andExpect(jsonPath("$.status").value("ABSENT"));

        mockMvc.perform(post("/api/teacher/absences")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());

        String studentToken = login("student.test@univ.ma", "Student123!");
        mockMvc.perform(get("/api/student/absences").header("Authorization", bearer(studentToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].courseName").value("Architecture logicielle"))
                .andExpect(jsonPath("$[0].groupName").value("GI-TEST"));
    }

    @Test
    void studentCannotAccessTeacherEndpoints() throws Exception {
        String studentToken = login("student.test@univ.ma", "Student123!");
        mockMvc.perform(get("/api/teacher/dashboard").header("Authorization", bearer(studentToken)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/teacher/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentCanSubmitProofAndTeacherCanApproveIt() throws Exception {
        String teacherToken = login("teacher.test@univ.ma", "Teacher123!");
        String body = objectMapper.writeValueAsString(Map.of(
                "studentId", student.getId(),
                "sessionId", session.getId()
        ));
        MvcResult created = mockMvc.perform(post("/api/teacher/absences")
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        long absenceId = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

        String studentToken = login("student.test@univ.ma", "Student123!");
        MockMultipartFile proof = new MockMultipartFile(
                "file", "certificat.png", "image/png", new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47});

        mockMvc.perform(multipart("/api/student/absences/{id}/justification", absenceId)
                        .file(proof)
                        .param("reason", "Certificat médical")
                        .header("Authorization", bearer(studentToken)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.fileName").value("certificat.png"));

        MvcResult pending = mockMvc.perform(get("/api/teacher/justifications")
                        .param("status", "PENDING")
                        .header("Authorization", bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentName").value("Amine Test"))
                .andReturn();
        long justificationId = objectMapper.readTree(pending.getResponse().getContentAsString())
                .get(0).get("id").asLong();

        String review = objectMapper.writeValueAsString(Map.of(
                "status", "APPROVED",
                "comment", "Document conforme"
        ));
        mockMvc.perform(patch("/api/teacher/justifications/{id}", justificationId)
                        .header("Authorization", bearer(teacherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(review))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(get("/api/teacher/absences").header("Authorization", bearer(teacherToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("JUSTIFIED"))
                .andExpect(jsonPath("$[0].justificationStatus").value("APPROVED"));
    }

    private AppUser user(String firstName, String lastName, String email, Role role,
                         StudentGroup group, String password) {
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

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8));
        assertThat(node.get("token").asText()).isNotBlank();
        return node.get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
