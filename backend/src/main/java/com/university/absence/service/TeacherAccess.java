package com.university.absence.service;

import com.university.absence.domain.AppUser;
import com.university.absence.domain.CourseSession;
import com.university.absence.domain.StudentGroup;
import com.university.absence.exception.NotFoundException;
import com.university.absence.repository.CourseRepository;
import com.university.absence.repository.SessionRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class TeacherAccess {

    private final SessionRepository sessionRepository;
    private final CourseRepository courseRepository;

    public TeacherAccess(SessionRepository sessionRepository, CourseRepository courseRepository) {
        this.sessionRepository = sessionRepository;
        this.courseRepository = courseRepository;
    }

    public boolean teachesGroup(Long teacherId, Long groupId) {
        if (sessionRepository.existsByTeacherIdAndGroupId(teacherId, groupId)) {
            return true;
        }
        return courseRepository.findByTeacherIdOrderByNameAsc(teacherId).stream()
                .anyMatch(course -> course.getGroup().getId().equals(groupId));
    }

    public void requireGroup(Long teacherId, Long groupId) {
        if (!teachesGroup(teacherId, groupId)) {
            throw new AccessDeniedException("Vous n'enseignez pas dans ce groupe.");
        }
    }

    public void requireSession(AppUser teacher, CourseSession session) {
        if (!session.getTeacher().getId().equals(teacher.getId())) {
            throw new AccessDeniedException("Cette séance ne vous appartient pas.");
        }
    }

    public StudentGroup requireTeacherGroup(AppUser teacher, Long groupId, com.university.absence.repository.GroupRepository groups) {
        requireGroup(teacher.getId(), groupId);
        return groups.findById(groupId)
                .orElseThrow(() -> new NotFoundException("Groupe introuvable"));
    }
}
