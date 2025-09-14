package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.TrainingTypeDTO;
import com.example.fitness_booking_system.services.TrainingTypeService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing training types in the fitness booking system.
 */
@RestController
@RequestMapping("/api/training-types")
@RequiredArgsConstructor
public class TrainingTypeController {

    /**
     * Service for handling training type-related operations.
     */
    private final TrainingTypeService trainingTypeService;

    /**
     * Endpoint to retrieve all training types.
     *
     * @return ResponseEntity containing a list of TrainingTypeDTOs
     */
    @GetMapping
    public ResponseEntity<List<TrainingTypeDTO>> getAllTrainingTypes() {
        return ResponseEntity.ok(trainingTypeService.getAllTrainingTypes());
    }

    /**
     * Endpoint to create a new training type.
     *
     * @param createDTO the DTO containing training type details
     * @return ResponseEntity containing the created TrainingTypeDTO
     */
    @PostMapping
    public ResponseEntity<TrainingTypeDTO> createTrainingType(@Valid @RequestBody TrainingTypeDTO createDTO) {
        TrainingTypeDTO createdType = trainingTypeService.createTrainingType(createDTO);
        return new ResponseEntity<>(createdType, HttpStatus.CREATED);
    }

    /**
     * Endpoint to update an existing training type.
     *
     * @param id        the ID of the training type to update
     * @param updateDTO the DTO containing updated training type details
     * @return ResponseEntity containing the updated TrainingTypeDTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<TrainingTypeDTO> updateTrainingType(
            @PathVariable Long id,
            @Valid @RequestBody TrainingTypeDTO updateDTO) {
        return ResponseEntity.ok(trainingTypeService.updateTrainingType(id, updateDTO));
    }

    /**
     * Endpoint to delete a training type by its ID.
     *
     * @param id the ID of the training type to delete
     * @return ResponseEntity with no content status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrainingType(@PathVariable Long id) {
        trainingTypeService.deleteTrainingType(id);
        return ResponseEntity.noContent().build();
    }
}