package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.dto.TrainerDTO;
import com.example.fitness_booking_system.services.TrainerService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing trainer profiles in the fitness booking system.
 */
@RestController
@RequestMapping("/api/trainers")
@RequiredArgsConstructor
public class TrainerController {

    /**
     * Service for handling trainer-related operations.
     */
    private final TrainerService trainerService;

    /**
     * Endpoint to get the profile of a trainer by their ID.
     *
     * @param id the ID of the trainer
     * @return ResponseEntity containing the TrainerDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<TrainerDTO> getTrainerProfile(@PathVariable Long id) {
        return ResponseEntity.ok(trainerService.getTrainerProfile(id));
    }

    /**
     * Endpoint to update the profile of a trainer.
     *
     * @param id               the ID of the trainer
     * @param profileUpdateDTO the DTO containing updated profile information
     * @return ResponseEntity containing the updated TrainerDTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<TrainerDTO> updateTrainerProfile(
            @PathVariable Long id,
            @Valid @RequestBody ProfileUpdateDTO profileUpdateDTO) {
        return ResponseEntity.ok(trainerService.updateTrainerProfile(id, profileUpdateDTO));
    }

    /**
     * Endpoint to retrieve all trainers.
     *
     * @return ResponseEntity containing a list of TrainerDTOs
     */
    @GetMapping
    public ResponseEntity<List<TrainerDTO>> getAllTrainers() {
        return ResponseEntity.ok(trainerService.getAllTrainers());
    }
}