package com.example.fitness_booking_system.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a client in the fitness booking system.
 * Each client is associated with a user and can have multiple bookings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "clients")
public class Client {

    /**
     * Unique identifier for the client.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user associated with this client.
     * This is a one-to-one relationship, meaning each client corresponds to exactly one user.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    /**
     * The full name of the client.
     */
    private LocalDate dateOfBirth;

    /**
     * The phone number of the client.
     */
    private String healthInformation;

    /**
     * The fitness goals of the client.
     */
    private String fitnessGoals;

    /**
     * The list of bookings made by the client.
     */
    @OneToMany(mappedBy = "client")
    private List<Booking> bookings = new ArrayList<>();
}