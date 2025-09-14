package com.example.fitness_booking_system.dto;

import com.example.fitness_booking_system.entities.UserRole;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for authentication response.
 * This class is used to transfer booking data between layers of the application.
 * Contains user details and authentication token.
 */
@Getter
@Setter
@Builder
public class AuthResponseDTO {
    private Long userId;
    private String email;
    private String fullName;
    private UserRole role;
    private Long profileId;
    private String token;
}