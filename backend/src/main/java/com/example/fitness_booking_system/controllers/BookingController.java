package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.BookingCreateDTO;
import com.example.fitness_booking_system.dto.BookingDTO;
import com.example.fitness_booking_system.services.BookingService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for handling booking-related operations.
 * Provides endpoints for creating, retrieving, and cancelling bookings.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    /**
     * Service for handling booking-related operations.
     */
    private final BookingService bookingService;

    /**
     * Endpoint to create a new booking.
     *
     * @param clientId  the ID of the client making the booking
     * @param createDTO the DTO containing booking details
     * @return ResponseEntity containing the created BookingDTO
     */
    @PostMapping("/client/{clientId}")
    public ResponseEntity<BookingDTO> createBooking(
            @PathVariable Long clientId,
            @Valid @RequestBody BookingCreateDTO createDTO) {
        BookingDTO createdBooking = bookingService.createBooking(clientId, createDTO);
        return new ResponseEntity<>(createdBooking, HttpStatus.CREATED);
    }

    /**
     * Endpoint to get all bookings of a specific client.
     *
     * @param clientId the ID of the client whose bookings are to be retrieved
     * @return ResponseEntity containing a list of BookingDTOs
     */
    @GetMapping("/client/{clientId}/bookings")
    public ResponseEntity<List<BookingDTO>> getClientBookings(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getClientBookings(clientId));
    }

    /**
     * Endpoint to cancel a booking by its ID.
     *
     * @param id the ID of the booking to be canceled
     * @return ResponseEntity containing the cancelled BookingDTO
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}