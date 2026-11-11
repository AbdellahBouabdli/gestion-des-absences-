package com.university.absence.repository;

import com.university.absence.domain.Course;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByTeacherIdOrderByNameAsc(Long teacherId);

    List<Course> findByGroupIdOrderByNameAsc(Long groupId);

    long countByTeacherId(Long teacherId);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByGroupId(Long groupId);
}
