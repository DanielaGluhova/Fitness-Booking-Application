package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.TrainingTypeDTO;
import com.example.fitness_booking_system.entities.TrainingTypeCategory;
import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import com.example.fitness_booking_system.services.TrainingTypeService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TrainingTypeController.class)
class TrainingTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private TrainingTypeService trainingTypeService;

    // Мокваме зависимостите, нужни за контекста на сигурността
    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserRepository userRepository;

    private TrainingTypeDTO trainingTypeDTO;

    @BeforeEach
    void setUp() {
        trainingTypeDTO = new TrainingTypeDTO();
        trainingTypeDTO.setId(1L);
        trainingTypeDTO.setName("Yoga");
        trainingTypeDTO.setDescription("A relaxing yoga session.");
        trainingTypeDTO.setDuration(60);
        trainingTypeDTO.setCategory(TrainingTypeCategory.GROUP);
        trainingTypeDTO.setMaxClients(10);
    }

    @Test
    @WithMockUser
    void shouldReturnListOfTrainingTypesWhenUserIsAuthenticated() throws Exception {
        when(trainingTypeService.getAllTrainingTypes()).thenReturn(Collections.singletonList(trainingTypeDTO));

        mockMvc.perform(get("/api/training-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Yoga"));
    }

    @Test
    void shouldReturnUnauthorizedWhenGettingAllTrainingTypesAndUserIsUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/training-types"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "TRAINER") // Само оторизиран потребител може да създава
    void shouldCreateTrainingTypeWhenDataIsValid() throws Exception {
        when(trainingTypeService.createTrainingType(any(TrainingTypeDTO.class))).thenReturn(trainingTypeDTO);

        mockMvc.perform(post("/api/training-types")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(trainingTypeDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser(roles = "TRAINER")
    void shouldReturnBadRequestWhenCreatingTrainingTypeWithInvalidData() throws Exception {
        TrainingTypeDTO invalidDTO = new TrainingTypeDTO(); // Липсват @NotBlank и @NotNull полета
        invalidDTO.setName(""); // @NotBlank ще хване това

        mockMvc.perform(post("/api/training-types")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnUnauthorizedWhenCreatingTrainingTypeAndUserIsUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/training-types")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(trainingTypeDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "TRAINER")
    void shouldUpdateTrainingTypeWhenDataIsValid() throws Exception {
        when(trainingTypeService.updateTrainingType(eq(1L), any(TrainingTypeDTO.class))).thenReturn(trainingTypeDTO);

        mockMvc.perform(put("/api/training-types/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(trainingTypeDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Yoga"));
    }

    @Test
    @WithMockUser(roles = "TRAINER")
    void shouldDeleteTrainingTypeWhenUserIsAuthorized() throws Exception {
        doNothing().when(trainingTypeService).deleteTrainingType(1L);

        mockMvc.perform(delete("/api/training-types/{id}", 1L)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(trainingTypeService, times(1)).deleteTrainingType(1L);
    }

    @Test
    void shouldReturnUnauthorizedWhenDeletingTrainingTypeAndUserIsUnauthenticated() throws Exception {
        mockMvc.perform(delete("/api/training-types/{id}", 1L)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}