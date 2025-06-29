
package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.dto.TrainerDTO;
import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import com.example.fitness_booking_system.services.TrainerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TrainerController.class)
class TrainerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TrainerService trainerService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserRepository userRepository;

    private TrainerDTO trainerDTO;

    @BeforeEach
    void setUp() {
        trainerDTO = TrainerDTO.builder()
                .id(1L)
                .userId(10L)
                .fullName("Test Trainer")
                .email("trainer@test.com")
                .bio("Experienced trainer.")
                .specializations(Set.of("Yoga", "Pilates"))
                .personalPrice(50.0)
                .groupPrice(25.0)
                .build();
    }

    @Test
    @WithMockUser
    void shouldReturnListOfTrainersWhenUserIsAuthenticated() throws Exception {
        when(trainerService.getAllTrainers()).thenReturn(Collections.singletonList(trainerDTO));

        mockMvc.perform(get("/api/trainers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].fullName").value("Test Trainer"));
    }

    @Test
    void shouldReturnUnauthorizedWhenGettingAllTrainersAndUserIsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/trainers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void shouldReturnTrainerProfileWhenIdIsValid() throws Exception {
        when(trainerService.getTrainerProfile(1L)).thenReturn(trainerDTO);

        mockMvc.perform(get("/api/trainers/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.email").value("trainer@test.com"));
    }

    @Test
    void shouldReturnUnauthorizedWhenGettingTrainerProfileAndUserIsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/trainers/{id}", 1L))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void shouldUpdateTrainerProfileWhenDataIsValid() throws Exception {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setFullName("Valid Name");
        updateDTO.setPhone("123456789");
        updateDTO.setBio("Updated bio.");
        updateDTO.setPersonalPrice(60.0);

        when(trainerService.updateTrainerProfile(eq(1L), any(ProfileUpdateDTO.class))).thenReturn(trainerDTO);

        mockMvc.perform(put("/api/trainers/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser
    void shouldReturnBadRequestWhenUpdatingProfileWithInvalidData() throws Exception {
        ProfileUpdateDTO invalidUpdateDTO = new ProfileUpdateDTO();

        mockMvc.perform(put("/api/trainers/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUpdateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnUnauthorizedWhenUpdatingProfileAndUserIsUnauthenticated() throws Exception {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setBio("Updated bio.");

        mockMvc.perform(put("/api/trainers/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isUnauthorized());
    }
}