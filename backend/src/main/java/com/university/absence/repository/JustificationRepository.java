package com.university.absence.repository;

import com.university.absence.domain.Justification;
import com.university.absence.domain.JustificationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JustificationRepository extends JpaRepository<Justification, Long> {

    Optional<Justification> findByAbsenceId(Long absenceId);

    @EntityGraph(attributePaths = {"absence", "absence.student", "absence.student.group", "absence.session",
            "absence.session.course", "absence.session.group", "absence.session.teacher", "reviewedBy"})
    @Query("select j from Justification j where j.id = :id")
    Optional<Justification> findWithDetailsById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"absence", "absence.student", "absence.student.group", "absence.session",
            "absence.session.course", "absence.session.group", "absence.session.teacher", "reviewedBy"})
    List<Justification> findByAbsenceStudentIdOrderBySubmittedAtDesc(Long studentId);

    @EntityGraph(attributePaths = {"absence", "absence.student", "absence.student.group", "absence.session",
            "absence.session.course", "absence.session.group", "absence.session.teacher", "reviewedBy"})
    List<Justification> findByAbsenceSessionTeacherIdOrderBySubmittedAtDesc(Long teacherId);

    @EntityGraph(attributePaths = {"absence", "absence.student", "absence.student.group", "absence.session",
            "absence.session.course", "absence.session.group", "absence.session.teacher", "reviewedBy"})
    List<Justification> findByAbsenceSessionTeacherIdAndStatusOrderBySubmittedAtAsc(
            Long teacherId, JustificationStatus status);

    @EntityGraph(attributePaths = {"absence", "absence.student", "absence.student.group", "absence.session",
            "absence.session.course", "absence.session.group", "absence.session.teacher", "reviewedBy"})
    List<Justification> findAllByOrderBySubmittedAtDesc();

    long countByAbsenceSessionTeacherIdAndStatus(Long teacherId, JustificationStatus status);

    long countByAbsenceStudentIdAndStatus(Long studentId, JustificationStatus status);

    long countByStatus(JustificationStatus status);
}
