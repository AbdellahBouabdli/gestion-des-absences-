package com.university.absence.service;

import com.university.absence.domain.AppUser;
import com.university.absence.domain.Role;
import com.university.absence.domain.StudentGroup;
import com.university.absence.dto.AcademicDtos.GroupRequest;
import com.university.absence.dto.AcademicDtos.GroupResponse;
import com.university.absence.exception.BadRequestException;
import com.university.absence.exception.ConflictException;
import com.university.absence.exception.NotFoundException;
import com.university.absence.repository.CourseRepository;
import com.university.absence.repository.GroupRepository;
import com.university.absence.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final TeacherAccess teacherAccess;
    private final DtoMapper mapper;

    public GroupService(GroupRepository groupRepository, UserRepository userRepository,
                        CourseRepository courseRepository, TeacherAccess teacherAccess, DtoMapper mapper) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.teacherAccess = teacherAccess;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> listAll() {
        return groupRepository.findAllByOrderByNameAsc().stream()
                .map(group -> mapper.toGroup(group, userRepository.countByRoleAndGroupId(Role.STUDENT, group.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> listForTeacher(AppUser teacher) {
        return groupRepository.findAllByOrderByNameAsc().stream()
                .filter(group -> teacherAccess.teachesGroup(teacher.getId(), group.getId()))
                .map(group -> mapper.toGroup(group, userRepository.countByRoleAndGroupId(Role.STUDENT, group.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public GroupResponse get(Long id) {
        StudentGroup group = find(id);
        return mapper.toGroup(group, userRepository.countByRoleAndGroupId(Role.STUDENT, group.getId()));
    }

    @Transactional
    public GroupResponse create(GroupRequest request) {
        String name = request.name().trim();
        if (groupRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Un groupe avec ce nom existe déjà.");
        }
        StudentGroup group = new StudentGroup();
        apply(group, request, name);
        return mapper.toGroup(groupRepository.save(group), 0);
    }

    @Transactional
    public GroupResponse update(Long id, GroupRequest request) {
        StudentGroup group = find(id);
        String name = request.name().trim();
        if (groupRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Un groupe avec ce nom existe déjà.");
        }
        apply(group, request, name);
        groupRepository.save(group);
        return mapper.toGroup(group, userRepository.countByRoleAndGroupId(Role.STUDENT, id));
    }

    @Transactional
    public void delete(Long id) {
        StudentGroup group = find(id);
        if (userRepository.countByRoleAndGroupId(Role.STUDENT, id) > 0) {
            throw new ConflictException("Impossible de supprimer un groupe contenant des étudiants.");
        }
        if (courseRepository.existsByGroupId(id)) {
            throw new ConflictException("Impossible de supprimer un groupe associé à des cours.");
        }
        groupRepository.delete(group);
    }

    @Transactional(readOnly = true)
    public StudentGroup find(Long id) {
        return groupRepository.findById(id).orElseThrow(() -> new NotFoundException("Groupe introuvable"));
    }

    private void apply(StudentGroup group, GroupRequest request, String name) {
        if (name.isBlank()) {
            throw new BadRequestException("Le nom du groupe est obligatoire.");
        }
        group.setName(name);
        group.setLevel(request.level().trim());
        group.setDepartment(request.department().trim());
    }
}
