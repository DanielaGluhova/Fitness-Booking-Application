package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.BookingCreateDTO;
import com.example.fitness_booking_system.dto.BookingDTO;
import com.example.fitness_booking_system.entities.BookingStatus;
import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import com.example.fitness_booking_system.services.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// This annotation does not load the full application context but only the web layer.
@WebMvcTest(BookingController.class)
class BookingControllerTest {

    // MockMvc is used to simulate HTTP requests and verify responses without a need of a running server.
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserRepository userRepository;

    // MockitoBean is used to create a mock of the BookingService, which will be injected into the controller.
    // It creates a simulated version of the BookingService for testing purposes.
    @MockitoBean
    private BookingService bookingService;

    @Test
    // WithMockUser is used to simulate an authenticated user for the test.
    @WithMockUser
    void shouldCreateBookingWhenDataIsValid() throws Exception {
        Long clientId = 1L;
        Long timeSlotId = 2L;

        BookingCreateDTO createDTO = new BookingCreateDTO();
        createDTO.setTimeSlotId(timeSlotId);

        BookingDTO bookingDTO = new BookingDTO();
        bookingDTO.setId(1L);
        bookingDTO.setClientId(clientId);
        bookingDTO.setTimeSlotId(timeSlotId);
        bookingDTO.setStatus(BookingStatus.CONFIRMED);
        bookingDTO.setStartTime(LocalDateTime.now().plusHours(1));
        bookingDTO.setEndTime(LocalDateTime.now().plusHours(2));

        when(bookingService.createBooking(eq(clientId), any(BookingCreateDTO.class))).thenReturn(bookingDTO);

        mockMvc.perform(post("/api/bookings/client/{clientId}", clientId)
                        // Using csrf() for PUT and POST requests to prevent CSRF attacks.
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.clientId").value(clientId))
                .andExpect(jsonPath("$.timeSlotId").value(timeSlotId))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @WithMockUser
    void shouldReturnBadRequestWhenCreatingBookingWithInvalidInput() throws Exception {
        Long clientId = 1L;
        BookingCreateDTO createDTO = new BookingCreateDTO();
        createDTO.setTimeSlotId(null); // Invalid input

        mockMvc.perform(post("/api/bookings/client/{clientId}", clientId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void shouldReturnClientBookingsWhenClientIdIsValid() throws Exception {
        Long clientId = 1L;
        BookingDTO bookingDTO = new BookingDTO();
        bookingDTO.setId(1L);
        bookingDTO.setClientId(clientId);
        List<BookingDTO> bookings = Collections.singletonList(bookingDTO);

        when(bookingService.getClientBookings(clientId)).thenReturn(bookings);

        mockMvc.perform(get("/api/bookings/client/{clientId}/bookings", clientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].clientId").value(clientId));
    }

    @Test
    @WithMockUser
    void shouldCancelBookingWhenBookingExists() throws Exception {
        Long bookingId = 1L;
        BookingDTO cancelledBookingDTO = new BookingDTO();
        cancelledBookingDTO.setId(bookingId);
        cancelledBookingDTO.setStatus(BookingStatus.CANCELLED);

        when(bookingService.cancelBooking(bookingId)).thenReturn(cancelledBookingDTO);

        mockMvc.perform(put("/api/bookings/{id}/cancel", bookingId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(bookingId))
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}