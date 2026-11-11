package com.university.absence.service;

import com.university.absence.domain.AppUser;
import com.university.absence.domain.CourseSession;
import com.university.absence.dto.AcademicDtos.SessionResponse;
import com.university.absence.exception.BadRequestException;
import com.university.absence.repository.SessionRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleService {

    private final SessionRepository sessionRepository;
    private final DtoMapper mapper;

    public ScheduleService(SessionRepository sessionRepository, DtoMapper mapper) {
        this.sessionRepository = sessionRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> teacherSchedule(AppUser teacher, LocalDate from, LocalDate to) {
        DateRange range = range(from, to);
        return sessionRepository
                .findByTeacherIdAndDateBetweenOrderByDateAscStartTimeAsc(teacher.getId(), range.from(), range.to())
                .stream().map(mapper::toSession).toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> studentSchedule(AppUser student, LocalDate from, LocalDate to) {
        if (student.getGroup() == null) {
            throw new BadRequestException("Aucun groupe n'est associé à votre compte.");
        }
        DateRange range = range(from, to);
        return sessionRepository
                .findByGroupIdAndDateBetweenOrderByDateAscStartTimeAsc(student.getGroup().getId(), range.from(), range.to())
                .stream().map(mapper::toSession).toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> todayForTeacher(AppUser teacher) {
        LocalDate today = LocalDate.now();
        return sessionRepository
                .findByTeacherIdAndDateBetweenOrderByDateAscStartTimeAsc(teacher.getId(), today, today)
                .stream().map(mapper::toSession).toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> nextForStudent(AppUser student, int limit) {
        if (student.getGroup() == null) {
            return List.of();
        }
        return sessionRepository
                .findByGroupIdAndDateGreaterThanEqualOrderByDateAscStartTimeAsc(
                        student.getGroup().getId(), LocalDate.now(), PageRequest.of(0, limit))
                .stream().map(mapper::toSession).toList();
    }

    @Transactional(readOnly = true)
    public List<CourseSession> rawSessionsForTeacher(Long teacherId, LocalDate from, LocalDate to) {
        return sessionRepository.findByTeacherIdAndDateBetweenOrderByDateAscStartTimeAsc(teacherId, from, to);
    }

    private DateRange range(LocalDate from, LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate end = to != null ? to : start.plusDays(6);
        if (end.isBefore(start)) {
            throw new BadRequestException("La date de fin doit être postérieure à la date de début.");
        }
        if (start.plusDays(120).isBefore(end)) {
            throw new BadRequestException("La période ne peut pas dépasser 120 jours.");
        }
        return new DateRange(start, end);
    }

    private record DateRange(LocalDate from, LocalDate to) {
    }
}
