package com.example.fitness_booking_system.dto;

import com.example.fitness_booking_system.entities.TimeSlotStatus;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) for a time slot.
 * This class is used to transfer booked client data between layers of the application.
 */
@Data
public class TimeSlotDTO {
    private Long id;
    private Long trainerId;
    private String trainerName;
    private Long trainingTypeId;
    private String trainingTypeName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;
    private Integer bookedCount;
    private TimeSlotStatus status;
    private Integer availableSpots;
}