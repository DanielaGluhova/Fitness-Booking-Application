package com.example.fitness_booking_system.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * DTO for creating a new time slot.
 */
@Data
public class TimeSlotCreateDTO {
    /**
     * ID of the trainer for the time slot.
     */
    @NotNull(message = "ID на треньор е задължително")
    private Long trainerId;

    /**
     * ID of the training type for the time slot.
     */
    @NotNull(message = "ID на тип тренировка е задължително")
    private Long trainingTypeId;

    /**
     * Start time of the time slot.
     */
    @NotNull(message = "Началният час е задължителен")
    @Future(message = "Началният час трябва да е в бъдеще")
    private LocalDateTime startTime;

    /**
     * End time of the time slot.
     */
    @NotNull(message = "Крайният час е задължителен")
    @Future(message = "Крайният час трябва да е в бъдеще")
    private LocalDateTime endTime;

    /**
     * Capacity of the time slot.
     */
    @Min(value = 1, message = "Капацитетът трябва да е поне 1")
    private Integer capacity;
}