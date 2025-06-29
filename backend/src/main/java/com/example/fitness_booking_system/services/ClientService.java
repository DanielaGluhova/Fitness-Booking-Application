package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.ClientDTO;
import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.entities.Client;
import com.example.fitness_booking_system.entities.User;
import com.example.fitness_booking_system.repositories.ClientRepository;
import com.example.fitness_booking_system.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

/**
 * Service for managing client profiles in the fitness booking system.
 */
@Service
@RequiredArgsConstructor
public class ClientService {

    /**
     * Repository for accessing client data.
     */
    private final ClientRepository clientRepository;
    /**
     * Repository for accessing user data.
     */
    private final UserRepository userRepository;

    /**
     * Retrieves the profile of a client by their ID.
     *
     * @param id the ID of the client
     * @return ClientDTO containing the client's profile information
     */
    public ClientDTO getClientProfile(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Клиентски профил не е намерен"));

        return mapToDTO(client);
    }

    /**
     * Updates the profile of a client.
     *
     * @param id               the ID of the client
     * @param profileUpdateDTO the DTO containing updated profile information
     * @return ClientDTO containing the updated client's profile information
     */
    @Transactional
    public ClientDTO updateClientProfile(Long id, ProfileUpdateDTO profileUpdateDTO) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Клиентски профил не е намерен"));

        User user = client.getUser();

        if (profileUpdateDTO.getFullName() != null) {
            user.setFullName(profileUpdateDTO.getFullName());
        }
        if (profileUpdateDTO.getPhone() != null) {
            user.setPhone(profileUpdateDTO.getPhone());
        }

        if (profileUpdateDTO.getDateOfBirth() != null && !profileUpdateDTO.getDateOfBirth().isEmpty()) {
            client.setDateOfBirth(LocalDate.parse(profileUpdateDTO.getDateOfBirth()));
        }
        if (profileUpdateDTO.getHealthInformation() != null) {
            client.setHealthInformation(profileUpdateDTO.getHealthInformation());
        }
        if (profileUpdateDTO.getFitnessGoals() != null) {
            client.setFitnessGoals(profileUpdateDTO.getFitnessGoals());
        }

        userRepository.save(user);
        Client updatedClient = clientRepository.save(client);

        return mapToDTO(updatedClient);
    }

    /**
     * Maps a Client entity to a ClientDTO.
     *
     * @param client the Client entity to map
     * @return ClientDTO containing the mapped data
     */
    private ClientDTO mapToDTO(Client client) {
        User user = client.getUser();

        return ClientDTO.builder()
                .id(client.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(client.getDateOfBirth())
                .healthInformation(client.getHealthInformation())
                .fitnessGoals(client.getFitnessGoals())
                .build();
    }
}