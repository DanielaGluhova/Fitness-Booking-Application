package com.example.fitness_booking_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object for Booked Client Information.
 * This class is used to transfer booked client data between layers of the application.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookedClientInfoDTO {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String healthInformation;
    private String fitnessGoals;
}