package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.TrainingTypeDTO;
import com.example.fitness_booking_system.entities.TrainingType;
import com.example.fitness_booking_system.entities.TrainingTypeCategory;
import com.example.fitness_booking_system.repositories.TrainingTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TrainingTypeServiceTest {

    @Mock
    private TrainingTypeRepository trainingTypeRepository;

    @InjectMocks
    private TrainingTypeService trainingTypeService;

    private TrainingType trainingType;
    private TrainingTypeDTO trainingTypeDTO;

    @BeforeEach
    void setUp() {
        trainingType = new TrainingType();
        trainingType.setId(1L);
        trainingType.setName("Йога");
        trainingType.setDescription("Релаксираща практика за тяло и ум.");
        trainingType.setDuration(60);
        trainingType.setCategory(TrainingTypeCategory.GROUP);
        trainingType.setMaxClients(15);

        trainingTypeDTO = new TrainingTypeDTO();
        trainingTypeDTO.setId(1L);
        trainingTypeDTO.setName("Йога");
        trainingTypeDTO.setDescription("Релаксираща практика за тяло и ум.");
        trainingTypeDTO.setDuration(60);
        trainingTypeDTO.setCategory(TrainingTypeCategory.GROUP);
        trainingTypeDTO.setMaxClients(15);
    }

    @Test
    void shouldGetAllTrainingTypes() {
        when(trainingTypeRepository.findAll()).thenReturn(Collections.singletonList(trainingType));
        List<TrainingTypeDTO> result = trainingTypeService.getAllTrainingTypes();
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(trainingType.getName(), result.get(0).getName());
    }

    @Test
    void shouldCreateTrainingTypeSuccessfully() {
        TrainingTypeDTO createDTO = new TrainingTypeDTO();
        createDTO.setName("Пилатес");

        when(trainingTypeRepository.existsByName("Пилатес")).thenReturn(false);
        when(trainingTypeRepository.save(any(TrainingType.class))).thenAnswer(invocation -> {
            TrainingType saved = invocation.getArgument(0);
            saved.setId(2L); // Simulate saving and getting an ID
            return saved;
        });

        TrainingTypeDTO result = trainingTypeService.createTrainingType(createDTO);

        assertNotNull(result);
        assertEquals("Пилатес", result.getName());
        assertEquals(2L, result.getId());
        verify(trainingTypeRepository).save(any(TrainingType.class));
    }

    @Test
    void shouldThrowConflictWhenCreatingTrainingTypeWithExistingName() {
        when(trainingTypeRepository.existsByName(trainingTypeDTO.getName())).thenReturn(true);
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> trainingTypeService.createTrainingType(trainingTypeDTO));
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(trainingTypeRepository, never()).save(any(TrainingType.class));
    }

    @Test
    void shouldUpdateTrainingTypeSuccessfully() {
        TrainingTypeDTO updateDTO = new TrainingTypeDTO();
        updateDTO.setName("Силова тренировка");
        updateDTO.setDescription("Интензивна тренировка за мускулна маса.");
        updateDTO.setDuration(90);
        updateDTO.setCategory(TrainingTypeCategory.PERSONAL);
        updateDTO.setMaxClients(1);


        when(trainingTypeRepository.findById(1L)).thenReturn(Optional.of(trainingType));
        when(trainingTypeRepository.existsByName("Силова тренировка")).thenReturn(false);
        when(trainingTypeRepository.save(any(TrainingType.class))).thenReturn(trainingType);

        TrainingTypeDTO result = trainingTypeService.updateTrainingType(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Силова тренировка", result.getName());
        assertEquals(90, result.getDuration());
        verify(trainingTypeRepository).save(trainingType);
    }

    @Test
    void shouldThrowNotFoundWhenUpdatingNonExistentTrainingType() {
        when(trainingTypeRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> trainingTypeService.updateTrainingType(2L, trainingTypeDTO));
    }

    @Test
    void shouldThrowConflictWhenUpdatingToExistingName() {
        TrainingTypeDTO updateDTO = new TrainingTypeDTO();
        updateDTO.setName("Пилатес"); // Искаме да сменим името на "Пилатес"

        when(trainingTypeRepository.findById(1L)).thenReturn(Optional.of(trainingType));
        when(trainingTypeRepository.existsByName("Пилатес")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> trainingTypeService.updateTrainingType(1L, updateDTO));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(trainingTypeRepository, never()).save(any(TrainingType.class));
    }

    @Test
    void shouldDeleteTrainingTypeSuccessfully() {
        when(trainingTypeRepository.existsById(1L)).thenReturn(true);
        doNothing().when(trainingTypeRepository).deleteById(1L);

        trainingTypeService.deleteTrainingType(1L);

        verify(trainingTypeRepository, times(1)).deleteById(1L);
    }

    @Test
    void shouldThrowNotFoundWhenDeletingNonExistentTrainingType() {
        when(trainingTypeRepository.existsById(2L)).thenReturn(false);
        assertThrows(ResponseStatusException.class, () -> trainingTypeService.deleteTrainingType(2L));
        verify(trainingTypeRepository, never()).deleteById(anyLong());
    }
}