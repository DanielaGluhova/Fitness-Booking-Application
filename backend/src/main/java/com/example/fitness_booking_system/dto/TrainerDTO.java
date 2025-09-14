package com.example.fitness_booking_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * Data Transfer Object for Trainer entity.
 * This class is used to transfer trainer data between layers of the application.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerDTO {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String bio;
    private Set<String> specializations;
    private Double personalPrice;
    private Double groupPrice;
}