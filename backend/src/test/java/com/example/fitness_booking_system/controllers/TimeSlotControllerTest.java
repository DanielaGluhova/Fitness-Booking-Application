package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.BookedClientInfoDTO;
import com.example.fitness_booking_system.dto.TimeSlotCreateDTO;
import com.example.fitness_booking_system.dto.TimeSlotDTO;
import com.example.fitness_booking_system.entities.TimeSlotStatus;
import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import com.example.fitness_booking_system.services.TimeSlotService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// This annotation is used to test the web layer of the application, focusing on the TimeSlotController without starting the entire application.
@WebMvcTest(TimeSlotController.class)
class TimeSlotControllerTest {

    // MockMvc is used to simulate HTTP requests and verify responses without needing a running server.
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // MockitoBean is used to create a mock of the TimeSlotService, which will be injected into the controller.
    @MockitoBean
    private TimeSlotService timeSlotService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserRepository userRepository;

    private TimeSlotDTO timeSlotDTO;

    @BeforeEach
    void setUp() {
        timeSlotDTO = new TimeSlotDTO();
        timeSlotDTO.setId(1L);
        timeSlotDTO.setTrainerId(1L);
        timeSlotDTO.setTrainerName("Test Trainer");
        timeSlotDTO.setStartTime(LocalDateTime.now().plusDays(1));
        timeSlotDTO.setEndTime(LocalDateTime.now().plusDays(1).plusHours(1));
        timeSlotDTO.setStatus(TimeSlotStatus.AVAILABLE);
    }

    @Test
    @WithMockUser
    void shouldGetAllTimeSlotsWhenRequested() throws Exception {
        when(timeSlotService.getAllTimeSlots()).thenReturn(Collections.singletonList(timeSlotDTO));

        mockMvc.perform(get("/api/time-slots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].trainerName").value("Test Trainer"));
    }

    @Test
    @WithMockUser
    void shouldGetTimeSlotsByTrainerAndDateRangeWhenDataIsValid() throws Exception {
        Long trainerId = 1L;
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusDays(1);

        when(timeSlotService.getTimeSlotsByTrainerAndDateRange(eq(trainerId), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(timeSlotDTO));

        mockMvc.perform(get("/api/time-slots/trainer/{trainerId}", trainerId)
                        .param("startDate", start.toString())
                        .param("endDate", end.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].trainerId").value(trainerId));
    }

    @Test
    @WithMockUser
    void shouldGetTimeSlotByIdWhenIdIsValid() throws Exception {
        when(timeSlotService.getTimeSlotById(1L)).thenReturn(timeSlotDTO);

        mockMvc.perform(get("/api/time-slots/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    // Only trainers can create time slots, so we use @WithMockUser with the TRAINER role.
    @WithMockUser(roles = "TRAINER")
    void shouldCreateTimeSlotWhenDataIsValid() throws Exception {
        TimeSlotCreateDTO createDTO = new TimeSlotCreateDTO();
        createDTO.setTrainerId(1L);
        createDTO.setTrainingTypeId(1L);
        createDTO.setStartTime(LocalDateTime.now().plusHours(2));
        createDTO.setEndTime(LocalDateTime.now().plusHours(3));
        createDTO.setCapacity(5);

        when(timeSlotService.createTimeSlot(any(TimeSlotCreateDTO.class))).thenReturn(timeSlotDTO);

        mockMvc.perform(post("/api/time-slots")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "TRAINER")
    void shouldReturnBadRequestWhenCreatingTimeSlotWithInvalidData() throws Exception {
        TimeSlotCreateDTO createDTO = new TimeSlotCreateDTO(); // Липсват задължителни полета

        mockMvc.perform(post("/api/time-slots")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    // This test checks the cancellation of a time slot by a specific trainer.
    @WithMockUser(username = "1", roles = "TRAINER")
    void shouldCancelTimeSlotWhenUserIsAuthorizedAndSlotExists() throws Exception {
        Long timeSlotId = 1L;

        when(timeSlotService.getTimeSlotById(timeSlotId)).thenReturn(timeSlotDTO);

        TimeSlotDTO cancelledSlot = new TimeSlotDTO();
        cancelledSlot.setId(timeSlotId);
        cancelledSlot.setStatus(TimeSlotStatus.CANCELLED);
        when(timeSlotService.cancelTimeSlot(timeSlotId)).thenReturn(cancelledSlot);

        mockMvc.perform(put("/api/time-slots/{id}/cancel", timeSlotId)
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    // Shows the clients booked for a specific time slot.
    @WithMockUser(username = "1", roles = "TRAINER")
    void shouldGetClientsForTimeSlotWhenUserIsAuthorizedAndSlotExists() throws Exception {
        Long timeSlotId = 1L;
        BookedClientInfoDTO clientInfo = BookedClientInfoDTO.builder().id(10L).fullName("Test Client").build();

        when(timeSlotService.getTimeSlotById(timeSlotId)).thenReturn(timeSlotDTO);

        when(timeSlotService.getClientsForTimeSlot(timeSlotId)).thenReturn(Collections.singletonList(clientInfo));

        mockMvc.perform(get("/api/time-slots/{id}/clients", timeSlotId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L))
                .andExpect(jsonPath("$[0].fullName").value("Test Client"));
    }
}