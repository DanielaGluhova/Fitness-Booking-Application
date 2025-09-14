package com.example.fitness_booking_system.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for validating authentication tokens.
 */
@RestController
@RequestMapping("/api/auth")
public class TokenValidationController {

    /**
     * Endpoint to validate the authentication token.
     * This endpoint can be used to check if the token is still valid.
     *
     * @return ResponseEntity containing a boolean indicating the validity of the token
     */
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken() {
        return ResponseEntity.ok(true);
    }
}