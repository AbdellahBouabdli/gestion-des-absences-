package com.university.absence.repository;

import com.university.absence.domain.Absence;
import com.university.absence.domain.AbsenceStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {

    boolean existsByStudentIdAndSessionId(Long studentId, Long sessionId);

    Optional<Absence> findByStudentIdAndSessionId(Long studentId, Long sessionId);

    @EntityGraph(attributePaths = {"student", "student.group", "session", "session.course",
            "session.group", "session.teacher", "recordedBy"})
    @Query("select a from Absence a where a.id = :id")
    Optional<Absence> findWithDetailsById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"student", "student.group", "session", "session.course",
            "session.group", "session.teacher", "recordedBy"})
    List<Absence> findByStudentIdOrderBySessionDateDescSessionStartTimeDesc(Long studentId);

    @EntityGraph(attributePaths = {"student", "student.group", "session", "session.course",
            "session.group", "session.teacher", "recordedBy"})
    List<Absence> findBySessionTeacherIdOrderBySessionDateDescSessionStartTimeDesc(Long teacherId);

    @EntityGraph(attributePaths = {"student", "student.group", "session", "session.course",
            "session.group", "session.teacher", "recordedBy"})
    List<Absence> findBySessionTeacherIdAndSessionDateBetweenOrderBySessionDateDescSessionStartTimeDesc(
            Long teacherId, LocalDate from, LocalDate to);

    @EntityGraph(attributePaths = {"student", "student.group", "session", "session.course",
            "session.group", "session.teacher", "recordedBy"})
    List<Absence> findBySessionGroupIdAndSessionDateBetweenOrderBySessionDateDescSessionStartTimeDesc(
            Long groupId, LocalDate from, LocalDate to);

    @EntityGraph(attributePaths = {"student", "student.group", "session", "session.course",
            "session.group", "session.teacher", "recordedBy"})
    List<Absence> findTop8ByOrderBySessionDateDescSessionStartTimeDesc();

    List<Absence> findBySessionId(Long sessionId);

    List<Absence> findByStudentIdAndSessionDateBetween(Long studentId, LocalDate from, LocalDate to);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(Long studentId, AbsenceStatus status);

    long countBySessionTeacherIdAndSessionDateBetween(Long teacherId, LocalDate from, LocalDate to);

    long countBySessionTeacherIdAndStatusAndSessionDateBetween(Long teacherId, AbsenceStatus status, LocalDate from, LocalDate to);

    long countBySessionGroupIdAndSessionDateBetween(Long groupId, LocalDate from, LocalDate to);

    long countByStatus(AbsenceStatus status);

    long countBySessionDateBetween(LocalDate from, LocalDate to);

    long countBySessionDateBetweenAndStatus(LocalDate from, LocalDate to, AbsenceStatus status);
}
