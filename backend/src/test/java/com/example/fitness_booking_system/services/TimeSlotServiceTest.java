package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.TimeSlotCreateDTO;
import com.example.fitness_booking_system.dto.TimeSlotDTO;
import com.example.fitness_booking_system.entities.*;
import com.example.fitness_booking_system.repositories.BookingRepository;
import com.example.fitness_booking_system.repositories.TimeSlotRepository;
import com.example.fitness_booking_system.repositories.TrainerRepository;
import com.example.fitness_booking_system.repositories.TrainingTypeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TimeSlotServiceTest {

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @Mock
    private TrainerRepository trainerRepository;

    @Mock
    private TrainingTypeRepository trainingTypeRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private TimeSlotService timeSlotService;

    private Trainer trainer;
    private User trainerUser;
    private TrainingType trainingType;
    private TimeSlot timeSlot;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @BeforeEach
    void setUp() {
        trainerUser = new User();
        trainerUser.setFullName("Тест Треньор");

        trainer = new Trainer();
        trainer.setId(1L);
        trainer.setUser(trainerUser);

        trainingType = new TrainingType();
        trainingType.setId(1L);
        trainingType.setName("Пилатес");
        trainingType.setDuration(60); // 60 минути

        startTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        endTime = startTime.plusMinutes(60);

        timeSlot = new TimeSlot();
        timeSlot.setId(1L);
        timeSlot.setTrainer(trainer);
        timeSlot.setTrainingType(trainingType);
        timeSlot.setStartTime(startTime);
        timeSlot.setEndTime(endTime);
        timeSlot.setCapacity(10);
        timeSlot.setBookedCount(0);
        timeSlot.setStatus(TimeSlotStatus.AVAILABLE);
    }

    @Test
    void shouldGetAllTimeSlots() {
        when(timeSlotRepository.findAll()).thenReturn(Collections.singletonList(timeSlot));
        List<TimeSlotDTO> result = timeSlotService.getAllTimeSlots();
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(timeSlot.getId(), result.get(0).getId());
    }

    @Test
    void shouldGetTimeSlotByIdSuccessfully() {
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
        TimeSlotDTO result = timeSlotService.getTimeSlotById(1L);
        assertNotNull(result);
        assertEquals(timeSlot.getId(), result.getId());
    }

    @Test
    void shouldThrowNotFoundWhenGettingNonExistentTimeSlot() {
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> timeSlotService.getTimeSlotById(1L));
    }

    @Test
    void shouldCreateTimeSlotSuccessfully() {
        TimeSlotCreateDTO createDTO = new TimeSlotCreateDTO();
        createDTO.setTrainerId(1L);
        createDTO.setTrainingTypeId(1L);
        createDTO.setStartTime(startTime);
        createDTO.setEndTime(endTime);
        createDTO.setCapacity(10);

        when(trainingTypeRepository.findById(1L)).thenReturn(Optional.of(trainingType));
        when(trainerRepository.findById(1L)).thenReturn(Optional.of(trainer));
        when(timeSlotRepository.hasOverlappingTimeSlot(1L, startTime, endTime)).thenReturn(false);
        when(timeSlotRepository.save(any(TimeSlot.class))).thenReturn(timeSlot);

        TimeSlotDTO result = timeSlotService.createTimeSlot(createDTO);

        assertNotNull(result);
        assertEquals(timeSlot.getId(), result.getId());
        verify(timeSlotRepository).save(any(TimeSlot.class));
    }

    @Test
    void shouldThrowBadRequestWhenCreatingSlotWithStartTimeAfterEndTime() {
        TimeSlotCreateDTO createDTO = new TimeSlotCreateDTO();
        createDTO.setStartTime(endTime);
        createDTO.setEndTime(startTime);
        assertThrows(ResponseStatusException.class, () -> timeSlotService.createTimeSlot(createDTO));
    }

    @Test
    void shouldThrowBadRequestWhenCreatingSlotWithWrongDuration() {
        TimeSlotCreateDTO createDTO = new TimeSlotCreateDTO();
        createDTO.setTrainerId(1L);
        createDTO.setTrainingTypeId(1L);
        createDTO.setStartTime(startTime);
        createDTO.setEndTime(endTime.plusMinutes(10)); // Грешна продължителност

        when(trainingTypeRepository.findById(1L)).thenReturn(Optional.of(trainingType));

        assertThrows(ResponseStatusException.class, () -> timeSlotService.createTimeSlot(createDTO));
    }

    @Test
    void shouldThrowConflictWhenCreatingOverlappingTimeSlot() {
        TimeSlotCreateDTO createDTO = new TimeSlotCreateDTO();
        createDTO.setTrainerId(1L);
        createDTO.setTrainingTypeId(1L);
        createDTO.setStartTime(startTime);
        createDTO.setEndTime(endTime);

        when(trainingTypeRepository.findById(1L)).thenReturn(Optional.of(trainingType));
        when(trainerRepository.findById(1L)).thenReturn(Optional.of(trainer));
        when(timeSlotRepository.hasOverlappingTimeSlot(1L, startTime, endTime)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> timeSlotService.createTimeSlot(createDTO));
    }
}
