package com.example.fitness_booking_system.repositories;

import com.example.fitness_booking_system.entities.TimeSlot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for managing time slots in the fitness booking system.
 * Provides methods to find time slots by trainer ID and time range, and to check for overlapping time slots.
 */
@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    /**
     * Finds all time slots for a specific trainer within a given time range.
     *
     * @param trainerId the ID of the trainer
     * @param start     the start time of the range
     * @param end       the end time of the range
     * @return a list of time slots for the trainer within the specified time range
     */
    List<TimeSlot> findByTrainerIdAndStartTimeBetween(Long trainerId, LocalDateTime start, LocalDateTime end);

    /**
     * Has overlapping(припокриващи се) time slots for a specific trainer within a given time range.
     * Checks if there are any time slots for the trainer that overlap with the specified start and end times.
     *
     * @param trainerId the ID of the trainer
     * @param startTime the start time of the range
     * @param endTime   the end time of the range
     * @return true if there are overlapping time slots, false otherwise
     */
    @Query("SELECT COUNT(ts) > 0 FROM TimeSlot ts WHERE ts.trainer.id = :trainerId " +
            "AND ((ts.startTime < :endTime AND ts.endTime > :startTime))")
    boolean hasOverlappingTimeSlot(Long trainerId, LocalDateTime startTime, LocalDateTime endTime);
}