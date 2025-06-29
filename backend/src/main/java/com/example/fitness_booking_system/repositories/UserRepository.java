package com.example.fitness_booking_system.repositories;

import com.example.fitness_booking_system.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing User entities in the fitness booking system.
 * Provides methods to find users by email and check if a user exists by email.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Finds a User entity by email.
     *
     * @param email the email of the user
     * @return an Optional containing the User if found, or empty if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists by email.
     *
     * @param email the email of the user
     * @return true if a user with the given email exists, false otherwise
     */
    boolean existsByEmail(String email);
}