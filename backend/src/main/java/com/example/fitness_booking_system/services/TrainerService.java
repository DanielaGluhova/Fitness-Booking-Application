package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.dto.TrainerDTO;
import com.example.fitness_booking_system.entities.Trainer;
import com.example.fitness_booking_system.entities.User;
import com.example.fitness_booking_system.repositories.TrainerRepository;
import com.example.fitness_booking_system.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing trainer profiles in the fitness booking system.
 */
@Service
@RequiredArgsConstructor
public class TrainerService {

    /**
     * Repository for accessing trainer data.
     */
    private final TrainerRepository trainerRepository;
    /**
     * Repository for accessing user data.
     */
    private final UserRepository userRepository;

    /**
     * Retrieves all trainers from the database and maps them to TrainerDTOs.
     *
     * @return a list of TrainerDTOs
     */
    public List<TrainerDTO> getAllTrainers() {
        return trainerRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves the profile of a trainer by their ID.
     *
     * @param id the ID of the trainer
     * @return the TrainerDTO containing the trainer's profile information
     */
    public TrainerDTO getTrainerProfile(Long id) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Треньорски профил не е намерен"));

        return mapToDTO(trainer);
    }

    /**
     * Updates the profile of a trainer based on the provided ProfileUpdateDTO.
     *
     * @param id               the ID of the trainer
     * @param profileUpdateDTO the DTO containing updated profile information
     * @return the updated TrainerDTO
     */
    @Transactional
    public TrainerDTO updateTrainerProfile(Long id, ProfileUpdateDTO profileUpdateDTO) {
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Треньорски профил не е намерен"));

        User user = trainer.getUser();

        if (profileUpdateDTO.getFullName() != null) {
            user.setFullName(profileUpdateDTO.getFullName());
        }
        if (profileUpdateDTO.getPhone() != null) {
            user.setPhone(profileUpdateDTO.getPhone());
        }

        if (profileUpdateDTO.getBio() != null) {
            trainer.setBio(profileUpdateDTO.getBio());
        }
        if (profileUpdateDTO.getSpecializations() != null) {
            trainer.setSpecializations(new HashSet<>(java.util.Arrays.asList(profileUpdateDTO.getSpecializations())));
        }
        if (profileUpdateDTO.getPersonalPrice() != null) {
            trainer.setPersonalPrice(profileUpdateDTO.getPersonalPrice());
        }
        if (profileUpdateDTO.getGroupPrice() != null) {
            trainer.setGroupPrice(profileUpdateDTO.getGroupPrice());
        }

        if (profileUpdateDTO.getTrainingTypeIds() != null) {
            trainer.setTrainingTypes(new HashSet<>(trainer.getTrainingTypes()));
            trainer.getTrainingTypes().clear();
        }

        userRepository.save(user);
        Trainer updatedTrainer = trainerRepository.save(trainer);

        return mapToDTO(updatedTrainer);
    }

    /**
     * Maps a Trainer entity to a TrainerDTO.
     *
     * @param trainer the Trainer entity to map
     * @return the mapped TrainerDTO
     */
    private TrainerDTO mapToDTO(Trainer trainer) {
        User user = trainer.getUser();

        return TrainerDTO.builder()
                .id(trainer.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .bio(trainer.getBio())
                .specializations(trainer.getSpecializations())
                .personalPrice(trainer.getPersonalPrice())
                .groupPrice(trainer.getGroupPrice())
                .build();
    }
}