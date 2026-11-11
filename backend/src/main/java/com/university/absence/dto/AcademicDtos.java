package com.university.absence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public final class AcademicDtos {

    private AcademicDtos() {
    }

    public record GroupResponse(
            Long id,
            String name,
            String level,
            String department,
            long studentCount
    ) {
    }

    public record GroupRequest(
            @NotBlank(message = "Le nom du groupe est obligatoire")
            @Size(max = 80)
            String name,

            @NotBlank(message = "Le niveau est obligatoire")
            @Size(max = 40)
            String level,

            @NotBlank(message = "Le département est obligatoire")
            @Size(max = 120)
            String department
    ) {
    }

    public record CourseResponse(
            Long id,
            String code,
            String name,
            String teacherName,
            Long groupId,
            String groupName
    ) {
    }

    public record SessionResponse(
            Long id,
            Long courseId,
            String courseCode,
            String courseName,
            Long groupId,
            String groupName,
            String teacherName,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String room
    ) {
    }
}
