package com.example.fitness_booking_system.dto;

import com.example.fitness_booking_system.entities.UserRole;

import lombok.Data;

import jakarta.validation.constraints.*;

/**
 * DTO for user registration requests.
 */
@Data
public class RegisterRequestDTO {
    /**
     * Email of the user.
     * This field is mandatory and must be a valid email format.
     */
    @NotBlank(message = "Имейлът е задължителен")
    @Email(message = "Моля, въведете валиден имейл")
    private String email;

    /**
     * Password of the user.
     * This field is mandatory and must be at least 6 characters long.
     */
    @NotBlank(message = "Паролата е задължителна")
    @Size(min = 6, message = "Паролата трябва да бъде поне 6 символа")
    private String password;

    /**
     * Full name of the user.
     * This field is mandatory and must be at least 5 characters long.
     */
    @NotBlank(message = "Името е задължително")
    @Size(min = 5, message = "Името трябва да бъде поне 5 символа")
    private String fullName;

    /**
     * Phone number of the user.
     * This field is mandatory and must match the specified regex pattern.
     */
    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{10,14}$", message = "Моля, въведете телефонния си номер в следния формат \"0123456789\" или \"+359123456789\"")
    private String phone;

    /**
     * Role of the user.
     * This field is mandatory and must be one of the predefined UserRole values.
     */
    @NotNull(message = "Ролята е задължителна")
    private UserRole role;

    // Fields for clients
    /**
     * Date of birth of the user.
     * This field is optional and should be in the format "yyyy-MM-dd".
     */
    private String dateOfBirth;

    /**
     * Health information of the user.
     * This field is optional and must not exceed 1000 characters.
     */
    @Size(max = 1000, message = "Здравната информация не може да бъде повече от 1000 символа")
    private String healthInformation;

    /**
     * Fitness goals of the user.
     * This field is optional and must not exceed 1000 characters.
     */
    @Size(max = 1000, message = "Фитнес целите не могат да бъдат повече от 1000 символа")
    private String fitnessGoals;

    // Fields for trainers
    /**
     * Biography of the trainer.
     * This field is optional and must not exceed 2000 characters.
     */
    @Size(max = 2000, message = "Биографията не може да бъде повече от 2000 символа")
    private String bio;

    /**
     * Specializations of the trainer.
     * This field is optional and can contain multiple specializations.
     */
    private String[] specializations;

    /**
     * Personal training price of the trainer.
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "Цената за персонална тренировка трябва да бъде положителна")
    @DecimalMax(value = "1000.0", message = "Цената за персонална тренировка не може да бъде повече от 1000 лв")
    private Double personalPrice;

    /**
     * Group training price of the trainer.
     */
    @DecimalMin(value = "0.0", inclusive = false, message = "Цената за групова тренировка трябва да бъде положителна")
    @DecimalMax(value = "500.0", message = "Цената за групова тренировка не може да бъде повече от 500 лв")
    private Double groupPrice;
}