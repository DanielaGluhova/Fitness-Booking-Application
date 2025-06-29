package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.BookedClientInfoDTO;
import com.example.fitness_booking_system.dto.TimeSlotCreateDTO;
import com.example.fitness_booking_system.dto.TimeSlotDTO;
import com.example.fitness_booking_system.services.TimeSlotService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for managing time slots in the fitness booking system.
 */
@RestController
@RequestMapping("/api/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    /**
     * Service for handling time-slot-related operations.
     */
    private final TimeSlotService timeSlotService;

    /**
     * Endpoint to retrieve all time slots.
     *
     * @return ResponseEntity containing a list of TimeSlotDTOs
     */
    @GetMapping
    public ResponseEntity<List<TimeSlotDTO>> getAllTimeSlots() {
        return ResponseEntity.ok(timeSlotService.getAllTimeSlots());
    }

    /**
     * Endpoint to retrieve time slots for a specific trainer within a date range.
     *
     * @param trainerId the ID of the trainer
     * @param startDate the start date and time of the range
     * @param endDate   the end date and time of the range
     * @return ResponseEntity containing a list of TimeSlotDTOs
     */
    @GetMapping("/trainer/{trainerId}")
    public ResponseEntity<List<TimeSlotDTO>> getTimeSlotsByTrainerAndDateRange(
            @PathVariable Long trainerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotsByTrainerAndDateRange(trainerId, startDate, endDate));
    }

    /**
     * Endpoint to retrieve a time slot by its ID.
     *
     * @param id the ID of the time slot
     * @return ResponseEntity containing the TimeSlotDTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<TimeSlotDTO> getTimeSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotById(id));
    }

    /**
     * Endpoint to create a new time slot.
     *
     * @param createDTO the DTO containing time slot details
     * @return ResponseEntity containing the created TimeSlotDTO
     */
    @PostMapping
    public ResponseEntity<TimeSlotDTO> createTimeSlot(@Valid @RequestBody TimeSlotCreateDTO createDTO) {
        TimeSlotDTO createdSlot = timeSlotService.createTimeSlot(createDTO);
        return new ResponseEntity<>(createdSlot, HttpStatus.CREATED);
    }

    /**
     * Endpoint to cancel a time slot by its ID.
     *
     * @param id the ID of the time slot to be cancelled
     * @return ResponseEntity containing the cancelled TimeSlotDTO
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('TRAINER') and @timeSlotService.getTimeSlotById(#id).trainerId == authentication.principal.id")
    public ResponseEntity<TimeSlotDTO> cancelTimeSlot(@PathVariable Long id) {
        return ResponseEntity.ok(timeSlotService.cancelTimeSlot(id));
    }

    /**
     * Endpoint to get clients booked for a specific time slot.
     *
     * @param id the ID of the time slot
     * @return ResponseEntity containing a list of BookedClientInfoDTOs
     */
    @GetMapping("/{id}/clients")
    @PreAuthorize("hasRole('TRAINER') and @timeSlotService.getTimeSlotById(#id).trainerId == authentication.principal.id")
    public ResponseEntity<List<BookedClientInfoDTO>> getClientsForTimeSlot(@PathVariable Long id) {
        return ResponseEntity.ok(timeSlotService.getClientsForTimeSlot(id));
    }
}