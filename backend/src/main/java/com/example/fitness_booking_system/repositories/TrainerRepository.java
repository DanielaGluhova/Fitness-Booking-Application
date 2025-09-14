// В TrainerRepository
package com.example.fitness_booking_system.repositories;

import com.example.fitness_booking_system.entities.Trainer;
import com.example.fitness_booking_system.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing Trainer entities in the fitness booking system.
 * Provides methods to find trainers by user.
 */
@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {
    /**
     * Finds a Trainer entity by the associated User.
     *
     * @param user the User associated with the Trainer
     * @return an Optional containing the Trainer if found, or empty if not found
     */
    Optional<Trainer> findByUser(User user);
}