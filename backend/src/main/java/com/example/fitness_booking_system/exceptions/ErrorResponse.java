package com.example.fitness_booking_system.exceptions;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ErrorResponse is a class that represents the structure of an error response
 * returned by the application when an exception occurs.
 * It includes details such as timestamp, status, error message, and any field-specific errors.
 */
@Data
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private Map<String, String> fieldErrors;
}