package com.university.absence.repository;

import com.university.absence.domain.AppUser;
import com.university.absence.domain.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    @EntityGraph(attributePaths = "group")
    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<AppUser> findByRoleOrderByLastNameAscFirstNameAsc(Role role);

    List<AppUser> findByRoleAndGroupIdOrderByLastNameAscFirstNameAsc(Role role, Long groupId);

    List<AppUser> findByGroupIdOrderByLastNameAscFirstNameAsc(Long groupId);

    long countByRole(Role role);

    long countByRoleAndGroupId(Role role, Long groupId);

    @Query("""
            select u from AppUser u
            where u.role = :role
              and (:groupId is null or u.group.id = :groupId)
              and (:search is null or lower(concat(u.firstName, ' ', u.lastName)) like lower(concat('%', :search, '%'))
                   or lower(u.email) like lower(concat('%', :search, '%')))
            order by u.lastName asc, u.firstName asc
            """)
    List<AppUser> search(@Param("role") Role role,
                         @Param("groupId") Long groupId,
                         @Param("search") String search);
}
