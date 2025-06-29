package com.example.fitness_booking_system.dto;

import jakarta.validation.constraints.*;

import lombok.Data;

/**
 * DTO for user login requests.
 */
@Data
public class LoginRequestDTO {
    @NotBlank(message = "Имейлът е задължителен")
    @Email(message = "Моля, въведете валиден имейл")
    private String email;

    @NotBlank(message = "Паролата е задължителна")
    private String password;
}