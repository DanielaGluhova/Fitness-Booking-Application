package com.example.fitness_booking_system.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a time slot for a training session.
 * Each time slot is associated with a trainer and a training type.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "time_slots")
public class TimeSlot {
    /**
     * Unique identifier for the time slot.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The trainer associated with this time slot.
     * This is a many-to-one relationship, meaning multiple time slots can be associated with one trainer.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    /**
     * The type of training for this time slot.
     * This is a many-to-one relationship, meaning multiple time slots can be associated with one training type.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_type_id", nullable = false)
    private TrainingType trainingType;

    /**
     * The start time of the time slot.
     */
    @Column(nullable = false)
    private LocalDateTime startTime;

    /**
     * The end time of the time slot.
     */
    @Column(nullable = false)
    private LocalDateTime endTime;

    /**
     * The maximum number of clients that can book this time slot.
     */
    private Integer capacity;

    /**
     * The number of clients that have booked this time slot.
     */
    private Integer bookedCount = 0;

    /**
     * The status of the time slot.
     * It can be either AVAILABLE (if there are spots left) or BOOKED (if the slot is fully booked).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeSlotStatus status = TimeSlotStatus.AVAILABLE;

    /**
     * The number of available spots in this time slot.
     * This is calculated as the difference between capacity and bookedCount.
     */
    public boolean canBeBooked() {
        return status == TimeSlotStatus.AVAILABLE && bookedCount < capacity;
    }

    /**
     * Adds a booking to this time slot.
     * Increments the bookedCount and updates the status if the slot is fully booked.
     * Throws an exception if the slot cannot be booked.
     */
    public void addBooking() {
        if (!canBeBooked()) {
            throw new IllegalStateException("Този слот не може да бъде резервиран");
        }

        bookedCount++;

        if (bookedCount >= capacity) {
            status = TimeSlotStatus.BOOKED;
        }
    }

    /**
     * Removes a booking from this time slot.
     * Decrements the bookedCount and updates the status if there are available spots.
     * Throws an exception if there are no bookings to remove.
     */
    public void removeBooking() {
        if (bookedCount <= 0) {
            throw new IllegalStateException("Няма резервации за премахване");
        }

        bookedCount--;

        if (status == TimeSlotStatus.BOOKED && bookedCount < capacity) {
            status = TimeSlotStatus.AVAILABLE;
        }
    }
}