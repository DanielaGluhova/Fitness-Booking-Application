package com.example.fitness_booking_system.repositories;

import com.example.fitness_booking_system.entities.Client;
import com.example.fitness_booking_system.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing clients in the fitness booking system.
 * Provides methods to find a client by their associated user.
 */
@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByUser(User user);
}