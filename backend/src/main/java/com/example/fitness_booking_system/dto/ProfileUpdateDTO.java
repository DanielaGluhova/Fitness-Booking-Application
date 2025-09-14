package com.example.fitness_booking_system.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

/**
 * DTO for updating user profile information.
 * Contains fields for both clients and trainers.
 */
@Data
public class ProfileUpdateDTO {
    /**
     * Full name of the user.
     */
    @NotBlank(message = "Името е задължително")
    private String fullName;

    /**
     * Phone number of the user.
     */
    @NotBlank(message = "Телефонът е задължителен")
    private String phone;

    //полета за клиенти
    /**
     * Date of birth of the user.
     */
    private String dateOfBirth;
    /**
     * Health information of the user.
     */
    private String healthInformation;
    /**
     * Fitness goals of the user.
     */
    private String fitnessGoals;

    //полета за треньори
    /**
     * Bio of the trainer.
     */
    private String bio;
    /**
     * Specializations of the trainer.
     */
    private String[] specializations;
    /**
     * Personal price for the trainer.
     */
    private Double personalPrice;
    /**
     * Group price for the trainer.
     */
    private Double groupPrice;
    /**
     * IDs of the training types that the trainer offers.
     */
    private Long[] trainingTypeIds;
}