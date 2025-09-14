package com.example.fitness_booking_system.dto;

import com.example.fitness_booking_system.entities.BookingStatus;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Booking information.
 * This class is used to transfer booking data between layers of the application.
 */
@Data
public class BookingDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long timeSlotId;
    private Long trainerId;
    private String trainerName;
    private String trainingTypeName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private String formattedDate;
    private String formattedTime;
}