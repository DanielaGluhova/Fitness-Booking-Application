package com.example.fitness_booking_system.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing a training type in the fitness booking system.
 * This class maps to the "training_types" table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "training_types")
public class TrainingType {
    /**
     * Unique identifier for the training type.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the training type.
     */
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * A description of the training type.
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * The duration of the training type in minutes.
     */
    private Integer duration;

    /**
     * The category of the training type, such as personal or group training.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainingTypeCategory category;

    /**
     * The maximum number of clients that can book a session of this training type.
     */
    private Integer maxClients;

    /**
     * The trainers associated with this training type.
     * This is a many-to-many relationship, meaning multiple trainers can offer the same training type,
     * and a trainer can offer multiple training types.
     */
    @ManyToMany(mappedBy = "trainingTypes")
    private Set<Trainer> trainers = new HashSet<>();
}