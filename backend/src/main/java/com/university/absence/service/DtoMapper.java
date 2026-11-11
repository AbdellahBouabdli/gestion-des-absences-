package com.university.absence.service;

import com.university.absence.domain.Absence;
import com.university.absence.domain.AppUser;
import com.university.absence.domain.Course;
import com.university.absence.domain.CourseSession;
import com.university.absence.domain.Justification;
import com.university.absence.domain.StudentGroup;
import com.university.absence.dto.AbsenceDtos.AbsenceResponse;
import com.university.absence.dto.AbsenceDtos.JustificationResponse;
import com.university.absence.dto.AcademicDtos.GroupResponse;
import com.university.absence.dto.AcademicDtos.SessionResponse;
import com.university.absence.dto.AuthDtos.UserResponse;
import com.university.absence.dto.PeopleDtos.StudentResponse;
import com.university.absence.dto.PeopleDtos.TeacherResponse;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public UserResponse toUser(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getGroup() != null ? user.getGroup().getId() : null,
                user.getGroup() != null ? user.getGroup().getName() : null
        );
    }

    public GroupResponse toGroup(StudentGroup group, long studentCount) {
        return new GroupResponse(group.getId(), group.getName(), group.getLevel(), group.getDepartment(), studentCount);
    }

    public SessionResponse toSession(CourseSession session) {
        Course course = session.getCourse();
        return new SessionResponse(
                session.getId(),
                course.getId(),
                course.getCode(),
                course.getName(),
                session.getGroup().getId(),
                session.getGroup().getName(),
                session.getTeacher().getFullName(),
                session.getDate(),
                session.getStartTime(),
                session.getEndTime(),
                session.getRoom()
        );
    }

    public StudentResponse toStudent(AppUser student, long absences, long justified, long totalSessions) {
        return new StudentResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getFullName(),
                student.getEmail(),
                student.getGroup() != null ? student.getGroup().getId() : null,
                student.getGroup() != null ? student.getGroup().getName() : null,
                absences,
                justified,
                rate(absences, totalSessions)
        );
    }

    public TeacherResponse toTeacher(AppUser teacher, long courses, long groups) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getFirstName(),
                teacher.getLastName(),
                teacher.getFullName(),
                teacher.getEmail(),
                courses,
                groups
        );
    }

    public AbsenceResponse toAbsence(Absence absence, Justification justification) {
        CourseSession session = absence.getSession();
        Course course = session.getCourse();
        return new AbsenceResponse(
                absence.getId(),
                absence.getStudent().getId(),
                absence.getStudent().getFullName(),
                session.getGroup().getId(),
                session.getGroup().getName(),
                session.getId(),
                course.getCode(),
                course.getName(),
                session.getDate(),
                session.getStartTime(),
                session.getEndTime(),
                session.getRoom(),
                absence.getStatus(),
                absence.getNote(),
                absence.getRecordedBy() != null ? absence.getRecordedBy().getFullName() : null,
                absence.getRecordedAt(),
                justification != null ? justification.getId() : null,
                justification != null ? justification.getStatus() : null
        );
    }

    public JustificationResponse toJustification(Justification justification) {
        Absence absence = justification.getAbsence();
        CourseSession session = absence.getSession();
        return new JustificationResponse(
                justification.getId(),
                absence.getId(),
                absence.getStudent().getId(),
                absence.getStudent().getFullName(),
                session.getGroup().getName(),
                session.getCourse().getName(),
                session.getDate(),
                session.getStartTime(),
                session.getEndTime(),
                justification.getReason(),
                justification.getOriginalFileName(),
                justification.getFileSize(),
                justification.getStatus(),
                justification.getSubmittedAt(),
                justification.getReviewedBy() != null ? justification.getReviewedBy().getFullName() : null,
                justification.getReviewedAt(),
                justification.getReviewComment(),
                "/api/files/justifications/" + justification.getId()
        );
    }

    public double rate(long absences, long sessions) {
        if (sessions <= 0) {
            return 0;
        }
        return Math.round((absences * 1000.0 / sessions)) / 10.0;
    }
}
