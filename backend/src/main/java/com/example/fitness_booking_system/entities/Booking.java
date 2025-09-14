package com.example.fitness_booking_system.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Booking entity representing a reservation made by a client for a specific time slot with an optional trainer.
 * It includes methods to cancel and complete bookings, ensuring that only confirmed bookings can be modified.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "booking")
public class Booking {

    /**
     * Unique identifier for the booking.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The client who made the booking.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    /**
     * The time slot for which the booking is made.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    /**
     * The trainer associated with the booking, if any.
     * This can be null if the booking is for a group session without a specific trainer.
     */
    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private Trainer trainer;

    /**
     * The type of training for this booking.
     */
    @Column(nullable = false)
    private LocalDateTime bookingTime = LocalDateTime.now();

    /**
     * The status of the booking, set as confirmed.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.CONFIRMED;

    /**
     * Method to cancel the booking. Sets the status to CANCELLED.
     */
    public void cancel() {
        if (this.status != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Само потвърдените резервации могат да бъдат отменени");
        }
        this.status = BookingStatus.CANCELLED;
    }
}