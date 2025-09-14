package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.dto.TrainerDTO;
import com.example.fitness_booking_system.entities.Trainer;
import com.example.fitness_booking_system.entities.User;
import com.example.fitness_booking_system.repositories.TrainerRepository;
import com.example.fitness_booking_system.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrainerServiceTest {

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TrainerService trainerService;

    private Trainer trainer;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setFullName("Георги Георгиев");
        user.setEmail("georgi@example.com");
        user.setPhone("0899123456");

        trainer = new Trainer();
        trainer.setId(1L);
        trainer.setUser(user);
        trainer.setBio("Опитен треньор по фитнес.");
        trainer.setSpecializations(new HashSet<>(Set.of("Силови тренировки", "Кардио")));
        trainer.setPersonalPrice(50.0);
        trainer.setGroupPrice(25.0);
    }

    @Test
    void shouldGetAllTrainers() {
        when(trainerRepository.findAll()).thenReturn(Collections.singletonList(trainer));
        List<TrainerDTO> result = trainerService.getAllTrainers();
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(trainer.getId(), result.get(0).getId());
        assertEquals(user.getFullName(), result.get(0).getFullName());
    }

    @Test
    void shouldGetTrainerProfileSuccessfully() {
        when(trainerRepository.findById(1L)).thenReturn(Optional.of(trainer));
        TrainerDTO result = trainerService.getTrainerProfile(1L);
        assertNotNull(result);
        assertEquals(trainer.getId(), result.getId());
        assertEquals(user.getFullName(), result.getFullName());
    }

    @Test
    void shouldThrowNotFoundWhenGettingNonExistentTrainerProfile() {
        when(trainerRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> trainerService.getTrainerProfile(1L));
    }

    @Test
    void shouldUpdateTrainerProfileSuccessfully() {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setFullName("Петър Петров");
        updateDTO.setPhone("0877112233");
        updateDTO.setBio("Ново био");
        updateDTO.setSpecializations(new String[]{"Йога", "Пилатес"});
        updateDTO.setPersonalPrice(60.0);
        updateDTO.setGroupPrice(30.0);

        when(trainerRepository.findById(1L)).thenReturn(Optional.of(trainer));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(trainerRepository.save(any(Trainer.class))).thenAnswer(i -> i.getArguments()[0]);

        TrainerDTO result = trainerService.updateTrainerProfile(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Петър Петров", result.getFullName());
        assertEquals("0877112233", result.getPhone());
        assertEquals("Ново био", result.getBio());
        assertTrue(result.getSpecializations().contains("Йога"));
        assertEquals(60.0, result.getPersonalPrice());
        assertEquals(30.0, result.getGroupPrice());

        verify(userRepository).save(user);
        verify(trainerRepository).save(trainer);
    }

    @Test
    void shouldUpdateOnlyProvidedFieldsInTrainerProfile() {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setBio("Актуализирано био.");
        updateDTO.setPersonalPrice(55.0);

        when(trainerRepository.findById(1L)).thenReturn(Optional.of(trainer));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(trainerRepository.save(any(Trainer.class))).thenAnswer(i -> i.getArguments()[0]);

        TrainerDTO result = trainerService.updateTrainerProfile(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Георги Георгиев", result.getFullName()); // Не е променено
        assertEquals("Актуализирано био.", result.getBio()); // Променено
        assertEquals(55.0, result.getPersonalPrice()); // Променено
        assertEquals(25.0, result.getGroupPrice()); // Не е променено
    }

    @Test
    void shouldThrowNotFoundWhenUpdatingNonExistentTrainerProfile() {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        when(trainerRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> trainerService.updateTrainerProfile(1L, updateDTO));
    }
}