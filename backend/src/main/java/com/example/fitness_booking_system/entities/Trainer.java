package com.example.fitness_booking_system.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Entity representing a fitness trainer.
 * This class maps to the "trainers" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "trainers")
public class Trainer {

    /**
     * Unique identifier for the trainer.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user associated with this trainer.
     * This is a one-to-one relationship, meaning each trainer is linked to exactly one user.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    /**
     * The biography of the trainer.
     */
    @Column(columnDefinition = "TEXT")
    private String bio;

    /**
     * The specializations of the trainer.
     * This is a collection of strings representing different areas of expertise.
     */
    @ElementCollection
    @CollectionTable(name = "trainer_specializations",
            joinColumns = @JoinColumn(name = "trainer_id"))
    @Column(name = "specialization_id")
    private Set<String> specializations = new HashSet<>();

    /**
     * The price for personal training sessions with this trainer.
     */
    private Double personalPrice;

    /**
     * The price for group training sessions with this trainer.
     */
    private Double groupPrice;

    /**
     * The training types that this trainer can conduct.
     * This is a many-to-many relationship, meaning a trainer can have multiple training types,
     * and a training type can be associated with multiple trainers.
     */
    @ManyToMany
    @JoinTable(
            name = "trainer_training_types",
            joinColumns = @JoinColumn(name = "trainer_id"),
            inverseJoinColumns = @JoinColumn(name = "training_type_id")
    )
    private Set<TrainingType> trainingTypes = new HashSet<>();

    /**
     * The time slots available for this trainer.
     * This is a one-to-many relationship, meaning a trainer can have multiple time slots.
     */
    @OneToMany(mappedBy = "trainer")
    private List<TrainerAvailability> availabilities = new ArrayList<>();

    /**
     * The bookings made for this trainer.
     * This is a one-to-many relationship, meaning a trainer can have multiple bookings.
     */
    @OneToMany(mappedBy = "trainer")
    private List<Booking> bookings = new ArrayList<>();
}