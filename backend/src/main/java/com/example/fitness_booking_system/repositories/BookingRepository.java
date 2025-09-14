
package com.example.fitness_booking_system.repositories;

import com.example.fitness_booking_system.entities.Booking;
import com.example.fitness_booking_system.entities.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for managing bookings in the fitness booking system.
 * Provides methods to find bookings by client ID, check if a client has a booking
 * for a specific time slot, and find bookings by time slot ID and status.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Finds all bookings made by a specific client.
     *
     * @param clientId the ID of the client
     * @return a list of bookings made by the client
     */
    List<Booking> findByClientId(Long clientId);

    /**
     * Checks if a client has a booking for a specific time slot.
     *
     * @param clientId   the ID of the client
     * @param timeSlotId the ID of the time slot
     * @return true if the client has a booking for the time slot, false otherwise
     */
    boolean existsByClientIdAndTimeSlotId(Long clientId, Long timeSlotId);

    /**
     * Checks if a client has an active (not cancelled) booking for a specific time slot.
     *
     * @param clientId   the ID of the client
     * @param timeSlotId the ID of the time slot
     * @param status     the status to exclude from the check
     * @return true if the client has an active booking for the time slot, false otherwise
     */
    boolean existsByClientIdAndTimeSlotIdAndStatusNot(Long clientId, Long timeSlotId, BookingStatus status);

    /**
     * Finds all bookings for a specific time slot with a given status.
     *
     * @param timeSlotId the ID of the time slot
     * @param status     the status of the bookings to find
     * @return a list of bookings for the time slot with the specified status
     */
    List<Booking> findByTimeSlotIdAndStatus(Long timeSlotId, BookingStatus status);
}