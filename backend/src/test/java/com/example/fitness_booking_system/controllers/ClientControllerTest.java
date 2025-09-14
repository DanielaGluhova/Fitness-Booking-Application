package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.dto.ClientDTO;
import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import com.example.fitness_booking_system.services.ClientService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// WebMvcTest is used to test the web layer of the application, focusing on Client Controller.
@WebMvcTest(ClientController.class)
/**
 * Test class for the ClientController, which handles client profile operations.
 * This class uses MockMvc to simulate HTTP requests and verify responses.
 */
class ClientControllerTest {

    /**
     * MockMvc instance for simulating HTTP requests.
     */
    @Autowired
    private MockMvc mockMvc;

    /**
     * ObjectMapper instance for converting objects to JSON.
     */
    @Autowired
    private ObjectMapper objectMapper;

    /**
     * JwtUtil instance for handling JWT operations.
     */
    @MockitoBean
    private JwtUtil jwtUtil;

    /**
     * Injects the UserRepository into the test context.
     * This is used to mock user-related database operations.
     */
    @MockitoBean
    private UserRepository userRepository;

    /**
     * Mocked service for handling client-related operations.
     */
    @MockitoBean
    private ClientService clientService;

    /**
     * Test for retrieving a client's profile by ID.
     * This test verifies that the controller correctly returns the client's profile information.
     * * @param clientId the ID of the client whose profile is to be retrieved
     * * @return ResponseEntity containing the ClientDTO with the client's profile information
     * * @throws Exception if an error occurs during the request processing
     */
    @Test
    @WithMockUser
    void shouldGetClientProfileWhenIdIsValid() throws Exception {
        // Arrange
        // Mocking a client profile with sample data
        // This data simulates a client profile that would be returned by the service.
        Long clientId = 1L;
        ClientDTO dto = ClientDTO.builder()
                .id(clientId)
                .userId(10L)
                .fullName("Иван Петров")
                .email("ivan@example.com")
                .phone("0888123456")
                .dateOfBirth(LocalDate.of(1990, 5, 10))
                .healthInformation("Няма заболявания")
                .fitnessGoals("Отслабване")
                .build();

        // Mocking the service call to return the client profile
        when(clientService.getClientProfile(clientId)).thenReturn(dto);

        // Act + Assert
        // Performing a GET request with the client ID and expecting a 200 OK status and the correct JSON response structure.
        mockMvc.perform(get("/api/clients/{id}", clientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clientId))
                .andExpect(jsonPath("$.userId").value(10L))
                .andExpect(jsonPath("$.fullName").value("Иван Петров"))
                .andExpect(jsonPath("$.email").value("ivan@example.com"))
                .andExpect(jsonPath("$.phone").value("0888123456"))
                .andExpect(jsonPath("$.healthInformation").value("Няма заболявания"))
                .andExpect(jsonPath("$.fitnessGoals").value("Отслабване"));
    }

    /**
     * Test for updating a client's profile.
     * This test verifies that the controller correctly updates the client's profile information.
     *
     * @throws Exception if an error occurs during the request processing
     * * @param clientId the ID of the client whose profile is to be updated
     * * @return ResponseEntity containing the updated ClientDTO with the client's profile information
     */
    @Test
    @WithMockUser(roles = "CLIENT")
    void shouldUpdateClientProfileWhenDataIsValid() throws Exception {
        // Arrange
        Long clientId = 1L;
        // Mocking a ProfileUpdateDTO with sample data
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setFullName("Нов Име");
        updateDTO.setPhone("0888999777");
        updateDTO.setDateOfBirth("1995-02-20");
        updateDTO.setHealthInformation("Астма");
        updateDTO.setFitnessGoals("Мускулна маса");

        // Mocking the service call to return the updated client profile
        ClientDTO responseDTO = ClientDTO.builder()
                .id(clientId)
                .userId(10L)
                .fullName("Нов Име")
                .email("ivan@example.com")
                .phone("0888999777")
                .dateOfBirth(LocalDate.of(1995, 2, 20))
                .healthInformation("Астма")
                .fitnessGoals("Мускулна маса")
                .build();

        // Mocking the clientService to return the updated profile when the update method is called
        when(clientService.updateClientProfile(clientId, updateDTO)).thenReturn(responseDTO);

        // Act + Assert
        // Performing a PUT request with the client ID and the updated profile data,
        mockMvc.perform(put("/api/clients/{id}", clientId)
                        // Only authenticated users with the "CLIENT" role can access this endpoint.
                        // Cross-Site Request Forgery (CSRF) protection is enabled for the request.
                        // That means the request must include a valid CSRF token.
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Нов Име"))
                .andExpect(jsonPath("$.phone").value("0888999777"))
                .andExpect(jsonPath("$.dateOfBirth").value("1995-02-20"))
                .andExpect(jsonPath("$.healthInformation").value("Астма"))
                .andExpect(jsonPath("$.fitnessGoals").value("Мускулна маса"));
    }

    /**
     * Test for updating a client's profile with invalid input.
     * This test verifies that the controller correctly handles invalid input and returns a Bad Request status.
     *
     * @throws Exception if an error occurs during the request processing
     */
    @Test
    @WithMockUser(roles = "CLIENT")
    void shouldReturnBadRequestWhenUpdatingProfileWithInvalidData() throws Exception {
        // Name and phone are required fields in ProfileUpdateDTO and cannot be empty @NotBlank
        ProfileUpdateDTO invalidDTO = new ProfileUpdateDTO();

        // Setting empty fields to simulate invalid input
        mockMvc.perform(put("/api/clients/{id}", 1L)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());
    }
}