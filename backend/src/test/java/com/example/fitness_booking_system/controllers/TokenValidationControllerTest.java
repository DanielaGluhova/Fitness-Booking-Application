package com.example.fitness_booking_system.controllers;

import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TokenValidationController.class)
class TokenValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    // This test simulates an authenticated user using @WithMockUser annotation.
    @WithMockUser
    void shouldReturnTrueWhenUserIsAuthenticated() throws Exception {
        // User is authienticated using @WithMockUser, so we expect the endpoint to return true.
        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
        // This test simulates an unauthenticated user by not using @WithMockUser.
    void shouldReturnUnauthorizedWhenUserIsUnauthenticated() throws Exception {
        // We expect the endpoint to return 401 Unauthorized when no user is authenticated.
        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isUnauthorized());
    }
}