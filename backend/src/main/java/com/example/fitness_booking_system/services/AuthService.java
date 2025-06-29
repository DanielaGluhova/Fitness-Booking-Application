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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.HashSet;

/**
 * Service for handling authentication and user registration.
 * This service provides methods for user registration and login,
 * including validation of user input and generation of JWT tokens.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    // Repositories for accessing user, client, and trainer data
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final TrainerRepository trainerRepository;
    // Password encoder for hashing passwords
    private final PasswordEncoder passwordEncoder;
    // JWT utility for generating and validating tokens
    private final JwtUtil jwtUtil;

    /**
     * Registers a new user in the system.
     * Validates the input data, checks for existing email, and creates user profiles based on the role.
     *
     * @param request The registration request containing user details.
     * @return An AuthResponseDTO containing user information and JWT token.
     */
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        // Check if the email is already registered
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Имейлът вече е зает");
        }

        LocalDate birthDate = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
            try {
                birthDate = LocalDate.parse(request.getDateOfBirth());
            } catch (DateTimeParseException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Невалиден формат на датата на раждане");
            }
        }

        // Validate role-specific fields and date of birth
        validateRoleSpecificFields(request, birthDate);

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole() : UserRole.CLIENT);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        Long profileId = null;

        if (savedUser.getRole() == UserRole.CLIENT) {
            profileId = createClientProfile(savedUser, request, birthDate);
        } else if (savedUser.getRole() == UserRole.TRAINER) {
            profileId = createTrainerProfile(savedUser, request);
        }

        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().toString());

        return AuthResponseDTO.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .profileId(profileId)
                .token(token)
                .build();
    }

    private void validateRoleSpecificFields(RegisterRequestDTO request, LocalDate birthDate) {
        if (request.getRole() == UserRole.TRAINER) {
            if (request.getPersonalPrice() != null && request.getPersonalPrice() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Цената за персонална тренировка трябва да бъде положителна");
            }
            if (request.getGroupPrice() != null && request.getGroupPrice() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Цената за групова тренировка трябва да бъде положителна");
            }
        }

        // Validate date of birth for clients
        if (birthDate != null) {
            if (birthDate.isAfter(LocalDate.now().minusYears(16))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Трябва да сте поне на 16 години");
            }
            if (birthDate.isBefore(LocalDate.now().minusYears(100))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Невалидна дата на раждане");
            }
        }
    }

    private Long createClientProfile(User user, RegisterRequestDTO request, LocalDate birthDate) {
        Client client = new Client();
        client.setUser(user);

        if (birthDate != null) {
            client.setDateOfBirth(birthDate);
        }

        client.setHealthInformation(request.getHealthInformation());
        client.setFitnessGoals(request.getFitnessGoals());

        Client savedClient = clientRepository.save(client);
        return savedClient.getId();
    }

    private Long createTrainerProfile(User user, RegisterRequestDTO request) {
        Trainer trainer = new Trainer();
        trainer.setUser(user);
        trainer.setBio(request.getBio());

        if (request.getSpecializations() != null) {
            trainer.setSpecializations(new HashSet<>(Arrays.asList(request.getSpecializations())));
        }

        trainer.setPersonalPrice(request.getPersonalPrice());
        trainer.setGroupPrice(request.getGroupPrice());

        Trainer savedTrainer = trainerRepository.save(trainer);
        return savedTrainer.getId();
    }

    /**
     * Logs in a user by validating their credentials and generating a JWT token.
     * If the user is a client or trainer, it retrieves their profile ID.
     *
     * @param request The login request containing email and password.
     * @return An AuthResponseDTO containing user information and JWT token.
     */
    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Невалидни потребителски данни"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Невалидни потребителски данни");
        }
        userRepository.save(user);

        Long profileId = null;
        if (user.getRole() == UserRole.CLIENT) {
            Client client = clientRepository.findByUser(user).orElse(null);
            if (client != null) {
                profileId = client.getId();
            }
        } else if (user.getRole() == UserRole.TRAINER) {
            Trainer trainer = trainerRepository.findByUser(user).orElse(null);
            if (trainer != null) {
                profileId = trainer.getId();
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().toString());

        return AuthResponseDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .profileId(profileId)
                .token(token)
                .build();
    }
}