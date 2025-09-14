package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.AuthResponseDTO;
import com.example.fitness_booking_system.dto.LoginRequestDTO;
import com.example.fitness_booking_system.dto.RegisterRequestDTO;
import com.example.fitness_booking_system.services.AuthService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    /**
     * Service for handling authentication and registration logic.
     */
    private final AuthService authService;

    /**
     * Endpoint for user registration.
     *
     * @param request the registration request containing user details
     * @return a response entity containing the authentication response
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    /**
     * Endpoint for user login.
     *
     * @param request the login request containing email and password
     * @return a response entity containing the authentication response
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

}