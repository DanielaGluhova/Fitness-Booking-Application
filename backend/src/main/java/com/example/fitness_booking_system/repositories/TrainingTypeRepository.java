package com.example.fitness_booking_system.repositories;

import com.example.fitness_booking_system.entities.TrainingType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing training types in the fitness booking system.
 * Provides methods to check if a training type exists by name.
 */
@Repository
public interface TrainingTypeRepository extends JpaRepository<TrainingType, Long> {
    /**
     * Checks if a training type exists by its name.
     *
     * @param name the name of the training type
     * @return true if a training type with the given name exists, false otherwise
     */
    boolean existsByName(String name);
}