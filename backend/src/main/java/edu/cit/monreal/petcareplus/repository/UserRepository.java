// This repository provides database operations for the User entity
package edu.cit.monreal.petcareplus.repository;

import edu.cit.monreal.petcareplus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
