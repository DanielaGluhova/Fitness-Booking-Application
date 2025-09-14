package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.TrainingTypeDTO;
import com.example.fitness_booking_system.entities.TrainingType;
import com.example.fitness_booking_system.repositories.TrainingTypeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing training types in the fitness booking system.
 * Provides methods to create, update, delete, and retrieve training types.
 */
@Service
@RequiredArgsConstructor
public class TrainingTypeService {

    /**
     * Repository for accessing training type data.
     */
    private final TrainingTypeRepository trainingTypeRepository;

    /**
     * Maps a TrainingType entity to a TrainingTypeDTO.
     *
     * @param trainingType the TrainingType entity to map
     * @return the mapped TrainingTypeDTO
     */
    private TrainingTypeDTO mapToDTO(TrainingType trainingType) {
        TrainingTypeDTO dto = new TrainingTypeDTO();
        dto.setId(trainingType.getId());
        dto.setName(trainingType.getName());
        dto.setDescription(trainingType.getDescription());
        dto.setDuration(trainingType.getDuration());
        dto.setCategory(trainingType.getCategory());
        dto.setMaxClients(trainingType.getMaxClients());
        return dto;
    }

    /**
     * Maps a TrainingTypeDTO to a TrainingType entity.
     *
     * @param dto the TrainingTypeDTO to map
     * @return the mapped TrainingType entity
     */
    private TrainingType mapToEntity(TrainingTypeDTO dto) {
        TrainingType trainingType = new TrainingType();
        trainingType.setName(dto.getName());
        trainingType.setDescription(dto.getDescription());
        trainingType.setDuration(dto.getDuration());
        trainingType.setCategory(dto.getCategory());
        trainingType.setMaxClients(dto.getMaxClients());
        return trainingType;
    }

    /**
     * Updates an existing TrainingType entity with values from a TrainingTypeDTO.
     *
     * @param entity the TrainingType entity to update
     * @param dto    the TrainingTypeDTO containing updated values
     */
    private void updateEntityFromDTO(TrainingType entity, TrainingTypeDTO dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDuration(dto.getDuration());
        entity.setCategory(dto.getCategory());
        entity.setMaxClients(dto.getMaxClients());
    }

    /**
     * Retrieves all training types.
     *
     * @return a list of TrainingTypeDTOs representing all training types
     */
    public List<TrainingTypeDTO> getAllTrainingTypes() {
        return trainingTypeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new training type.
     * If a training type with the same name already exists, a conflict error is thrown.
     *
     * @param createDTO the DTO containing details of the training type to create
     * @return the created TrainingTypeDTO
     */
    public TrainingTypeDTO createTrainingType(TrainingTypeDTO createDTO) {
        if (trainingTypeRepository.existsByName(createDTO.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Тип тренировка с име " + createDTO.getName() + " вече съществува");
        }

        TrainingType trainingType = mapToEntity(createDTO);
        TrainingType savedType = trainingTypeRepository.save(trainingType);
        return mapToDTO(savedType);
    }

    /**
     * Updates an existing training type.
     * If the training type with the given ID does not exist, a not found error is thrown.
     * If a training type with the new name already exists, a conflict error is thrown.
     *
     * @param id        the ID of the training type to update
     * @param updateDTO the DTO containing updated details of the training type
     * @return the updated TrainingTypeDTO
     */
    public TrainingTypeDTO updateTrainingType(Long id, TrainingTypeDTO updateDTO) {
        TrainingType existingType = trainingTypeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Типът тренировка не е намерен с ID: " + id));

        if (!existingType.getName().equals(updateDTO.getName()) &&
                trainingTypeRepository.existsByName(updateDTO.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Тип тренировка с име " + updateDTO.getName() + " вече съществува");
        }

        updateEntityFromDTO(existingType, updateDTO);
        TrainingType updatedType = trainingTypeRepository.save(existingType);
        return mapToDTO(updatedType);
    }

    /**
     * Deletes a training type by its ID.
     * If the training type with the given ID does not exist, a not found error is thrown.
     *
     * @param id the ID of the training type to delete
     */
    public void deleteTrainingType(Long id) {
        if (!trainingTypeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Типът тренировка не е намерен с ID: " + id);
        }
        trainingTypeRepository.deleteById(id);
    }
}