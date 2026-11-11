package com.university.absence.dto;

import java.util.List;

public final class StatsDtos {

    private StatsDtos() {
    }

    public record MetricPoint(String label, long value) {
    }

    public record CourseStat(String courseName, long absences, long sessions, double rate) {
    }

    public record GroupStat(Long groupId, String groupName, long students, long absences, long sessions, double rate) {
    }

    public record TeacherDashboard(
            long totalGroups,
            long totalStudents,
            long sessionsThisWeek,
            long absencesThisMonth,
            long pendingJustifications,
            double absenceRate,
            long justifiedAbsences,
            List<MetricPoint> weeklyTrend,
            List<GroupStat> groupStats,
            List<AbsenceDtos.AbsenceResponse> recentAbsences,
            List<AcademicDtos.SessionResponse> todaySessions
    ) {
    }

    public record StudentDashboard(
            long totalSessions,
            long totalAbsences,
            long justifiedAbsences,
            long pendingJustifications,
            double absenceRate,
            List<CourseStat> courseStats,
            List<AbsenceDtos.AbsenceResponse> recentAbsences,
            List<AcademicDtos.SessionResponse> nextSessions
    ) {
    }

    public record AdminDashboard(
            long totalStudents,
            long totalTeachers,
            long totalGroups,
            long totalSessions,
            long totalAbsences,
            long pendingJustifications,
            double absenceRate,
            List<GroupStat> groupStats,
            List<MetricPoint> monthlyTrend,
            List<PeopleDtos.StudentResponse> topStudents,
            List<AbsenceDtos.AbsenceResponse> recentAbsences
    ) {
    }
}
