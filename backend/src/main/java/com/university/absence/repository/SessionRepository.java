package com.university.absence.repository;

import com.university.absence.domain.CourseSession;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionRepository extends JpaRepository<CourseSession, Long> {

    List<CourseSession> findByGroupIdAndDateBetweenOrderByDateAscStartTimeAsc(Long groupId, LocalDate from, LocalDate to);

    List<CourseSession> findByTeacherIdAndDateBetweenOrderByDateAscStartTimeAsc(Long teacherId, LocalDate from, LocalDate to);

    List<CourseSession> findByGroupIdAndDateLessThanEqualOrderByDateDescStartTimeDesc(Long groupId, LocalDate date);

    List<CourseSession> findByTeacherIdAndDateLessThanEqualOrderByDateDescStartTimeDesc(Long teacherId, LocalDate date);

    List<CourseSession> findByGroupIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(Long groupId, LocalDate date, Pageable pageable);

    List<CourseSession> findByTeacherIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(Long teacherId, LocalDate date, Pageable pageable);

    long countByGroupIdAndDateLessThanEqual(Long groupId, LocalDate date);

    long countByGroupIdAndDateBetween(Long groupId, LocalDate from, LocalDate to);

    long countByTeacherIdAndDateBetween(Long teacherId, LocalDate from, LocalDate to);

    long countByTeacherIdAndDateLessThanEqual(Long teacherId, LocalDate date);

    long countByDateLessThanEqual(LocalDate date);

    boolean existsByTeacherIdAndGroupId(Long teacherId, Long groupId);

    @Query("select distinct s.group.id from CourseSession s where s.teacher.id = :teacherId")
    List<Long> findDistinctGroupIdsByTeacherId(@Param("teacherId") Long teacherId);

    @Query("select distinct s.group from CourseSession s where s.teacher.id = :teacherId order by s.group.name")
    List<com.university.absence.domain.StudentGroup> findDistinctGroupsByTeacherId(@Param("teacherId") Long teacherId);
}
