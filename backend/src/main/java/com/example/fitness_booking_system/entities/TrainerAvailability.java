package com.example.fitness_booking_system.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Entity representing the availability of a trainer.
 * This class maps to the 'trainer_availabilities' table in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "trainer_availabilities")
public class TrainerAvailability {

    /**
     * Unique identifier for the trainer availability record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The trainer associated with this availability.
     * This is a many-to-one relationship, meaning multiple availabilities can be associated with one trainer.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    /**
     * Date for which the availability is set.
     */
    private LocalDate date;

    /**
     * Start time of the availability.
     */
    private LocalTime startTime;

    /**
     * End time of the availability.
     */
    private LocalTime endTime;

    /**
     * Day of the week for which the availability is set.
     * This is used to define weekly recurring availabilities.
     */
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    /**
     * Maximum number of clients that can book this availability.
     * This defines the capacity for the trainer's availability.
     */
    private Integer capacity;

    /**
     * The type of availability.
     * This can be used to categorize the availability, such as whether it's for a specific training type or general availability.
     */
    @Enumerated(EnumType.STRING)
    private TrainingTypeCategory availabilityType;
}