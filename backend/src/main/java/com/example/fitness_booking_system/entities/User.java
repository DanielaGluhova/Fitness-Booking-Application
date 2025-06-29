package com.example.fitness_booking_system.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a user in the fitness booking system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    /**
     * Unique identifier for the user.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The email of the user.
     * It must be unique and cannot be null.
     */
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * The password of the user.
     * It cannot be null.
     */
    @Column(nullable = false)
    private String password;

    /**
     * The full name of the user.
     * It cannot be null.
     */
    private String fullName;

    /**
     * The phone number of the user.
     * It can be null.
     */
    private String phone;

    /**
     * The role of the user in the system.
     * It cannot be null and is stored as a string.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    /**
     * The date and time when the user was created.
     * It is automatically set to the current date and time when the user is created.
     */
    private LocalDateTime createdAt;
}