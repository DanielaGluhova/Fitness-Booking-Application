package com.example.fitness_booking_system.dto;

import jakarta.validation.constraints.NotNull;

import lombok.Data;

/**
 * DTO for creating a new booking.
 */
@Data
public class BookingCreateDTO {
    @NotNull(message = "ID на времевия слот е задължително")
    private Long timeSlotId;
}