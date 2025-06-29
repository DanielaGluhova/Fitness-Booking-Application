package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.ClientDTO;
import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.services.ClientService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing client profiles.
 */
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    /**
     * Service for handling client-related operations.
     */
    private final ClientService clientService;

    /**
     * Endpoint to get the profile of a client by their ID.
     *
     * @param id the ID of the client
     * @return ResponseEntity containing the ClientDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClientDTO> getClientProfile(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getClientProfile(id));
    }

    /**
     * Endpoint to update the profile of a client.
     *
     * @param id               the ID of the client
     * @param profileUpdateDTO the DTO containing updated profile information
     * @return ResponseEntity containing the updated ClientDTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<ClientDTO> updateClientProfile(
            @PathVariable Long id,
            @Valid @RequestBody ProfileUpdateDTO profileUpdateDTO) {
        return ResponseEntity.ok(clientService.updateClientProfile(id, profileUpdateDTO));
    }
}