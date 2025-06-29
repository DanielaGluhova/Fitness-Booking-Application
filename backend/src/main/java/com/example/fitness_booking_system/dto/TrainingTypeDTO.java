package com.example.fitness_booking_system.dto;

import com.example.fitness_booking_system.entities.TrainingTypeCategory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

/**
 * DTO for a training type.
 */
@Data
public class TrainingTypeDTO {
    /**
     * ID of the training type.
     */
    private Long id;

    /**
     * Name of the training type.
     */
    @NotBlank(message = "Името не може да бъде празно")
    private String name;

    /**
     * Description of the training type.
     */
    private String description;

    /**
     * Duration of the training type in minutes.
     */
    @NotNull(message = "Продължителността е задължителна")
    @Min(value = 15, message = "Продължителността трябва да бъде поне 15 минути")
    private Integer duration;

    /**
     * Category of the training type.
     */
    @NotNull(message = "Категорията е задължителна")
    private TrainingTypeCategory category;

    /**
     * Maximum number of clients that can book this training type.
     */
    private Integer maxClients;
}