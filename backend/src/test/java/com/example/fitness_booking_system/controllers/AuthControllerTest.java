package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.SecurityConfig;
import com.example.fitness_booking_system.dto.AuthResponseDTO;
import com.example.fitness_booking_system.dto.LoginRequestDTO;
import com.example.fitness_booking_system.dto.RegisterRequestDTO;
import com.example.fitness_booking_system.entities.UserRole;
import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import com.example.fitness_booking_system.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// This annotation only loads the web layer of the application, allowing us to test the AuthController without starting the entire application context.
@WebMvcTest(AuthController.class)
// Test has to import the real SecurityConfig to ensure that the routes /api/auth/** are protected correctly.
// and also to use the JwtUtil for token generation.
@Import({SecurityConfig.class, JwtUtil.class})
class AuthControllerTest {

    // HTTP requests will be simulated using MockMvc
    @Autowired
    private MockMvc mockMvc;

    // ObjectMapper is used to convert Java objects to JSON and vice versa
    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    // Simulated UserRepository to avoid hitting the actual database during tests
    @MockitoBean
    private UserRepository userRepository;

    @Test
    void shouldRegisterUserWhenDataIsValid() throws Exception {
        RegisterRequestDTO registerRequest = new RegisterRequestDTO();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Test User");
        registerRequest.setPhone("1234567890");
        registerRequest.setRole(UserRole.CLIENT);

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .userId(1L)
                .email("test@example.com")
                .fullName("Test User")
                .token("test-token")
                .build();

        var token = jwtUtil.generateToken(registerRequest.getEmail(), "ROLE_CLIENT");

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.token").value("test-token"));
    }

    @Test
    void shouldReturnBadRequestWhenRegisteringWithInvalidData() throws Exception {
        RegisterRequestDTO registerRequest = new RegisterRequestDTO();
        registerRequest.setEmail("not-an-email");
        registerRequest.setPassword("123");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldLoginUserWhenCredentialsAreValid() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .userId(1L)
                .email("test@example.com")
                .fullName("Test User")
                .token("test-token")
                .build();

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"))
                .andExpect(jsonPath("$.token").value("test-token"));
    }

    @Test
    void shouldReturnBadRequestWhenLoggingInWithInvalidData() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        // No password

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }
}