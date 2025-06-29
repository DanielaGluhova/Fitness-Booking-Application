package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.AuthResponseDTO;
import com.example.fitness_booking_system.dto.LoginRequestDTO;
import com.example.fitness_booking_system.dto.RegisterRequestDTO;
import com.example.fitness_booking_system.entities.Client;
import com.example.fitness_booking_system.entities.Trainer;
import com.example.fitness_booking_system.entities.User;
import com.example.fitness_booking_system.entities.UserRole;
import com.example.fitness_booking_system.repositories.ClientRepository;
import com.example.fitness_booking_system.repositories.TrainerRepository;
import com.example.fitness_booking_system.repositories.UserRepository;
import com.example.fitness_booking_system.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

// This annotation is used to run the test class with Mockito's extension, allowing us to use @Mock and @InjectMocks annotations.
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    // Creates simulated versions of the UserRepository, ClientRepository, TrainerRepository, PasswordEncoder, and JwtUtil.
    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    // Creates an instance of AuthService and injects the mocked dependencies into it.
    @InjectMocks
    private AuthService authService;

    private RegisterRequestDTO registerRequestDTO;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequestDTO = new RegisterRequestDTO();
        registerRequestDTO.setEmail("test@example.com");
        registerRequestDTO.setPassword("password123");
        registerRequestDTO.setFullName("Test User");
        registerRequestDTO.setPhone("0888123456");
        registerRequestDTO.setDateOfBirth("1990-01-01");
        registerRequestDTO.setRole(UserRole.CLIENT);

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setFullName("Test User");
        user.setRole(UserRole.CLIENT);
    }

    @Test
    void shouldRegisterClientWhenDataIsValid() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        Client client = new Client();
        client.setId(10L);
        client.setUser(user);
        when(clientRepository.save(any(Client.class))).thenReturn(client);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("test.token");

        // Act
        AuthResponseDTO response = authService.register(registerRequestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(user.getId(), response.getUserId());
        assertEquals(client.getId(), response.getProfileId());
        assertEquals("test.token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
        verify(clientRepository, times(1)).save(any(Client.class));
        verify(trainerRepository, never()).save(any(Trainer.class));
    }

    @Test
    void shouldRegisterTrainerWhenDataIsValid() {
        // Arrange
        registerRequestDTO.setRole(UserRole.TRAINER);
        registerRequestDTO.setPersonalPrice(50.00);
        user.setRole(UserRole.TRAINER);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        Trainer trainer = new Trainer();
        trainer.setId(20L);
        trainer.setUser(user);
        when(trainerRepository.save(any(Trainer.class))).thenReturn(trainer);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("test.token");

        // Act
        AuthResponseDTO response = authService.register(registerRequestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(user.getId(), response.getUserId());
        assertEquals(trainer.getId(), response.getProfileId());
        assertEquals(UserRole.TRAINER, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
        verify(trainerRepository, times(1)).save(any(Trainer.class));
        verify(clientRepository, never()).save(any(Client.class));
    }


    @Test
    void shouldThrowExceptionWhenRegisteringWithExistingEmail() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.register(registerRequestDTO);
        });

        assertEquals("400 BAD_REQUEST \"Имейлът вече е зает\"", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenRegisteringWithInvalidBirthDate() {
        // Arrange
        registerRequestDTO.setDateOfBirth(LocalDate.now().minusYears(15).toString());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.register(registerRequestDTO);
        });

        assertEquals("400 BAD_REQUEST \"Трябва да сте поне на 16 години\"", exception.getMessage());
    }


    @Test
    void shouldLoginUserWhenCredentialsAreValid() {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        Client client = new Client();
        client.setId(10L);
        when(clientRepository.findByUser(any(User.class))).thenReturn(Optional.of(client));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("test.token");

        // Act
        AuthResponseDTO response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals(user.getId(), response.getUserId());
        assertEquals(client.getId(), response.getProfileId());
        assertEquals("test.token", response.getToken());
    }

    @Test
    void shouldThrowExceptionWhenLoggingInWithNonExistentEmail() {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("nouser@example.com");
        loginRequest.setPassword("password123");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("401 UNAUTHORIZED \"Невалидни потребителски данни\"", exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenLoggingInWithIncorrectPassword() {
        // Arrange
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("wrongpassword");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("401 UNAUTHORIZED \"Невалидни потребителски данни\"", exception.getMessage());
    }
}