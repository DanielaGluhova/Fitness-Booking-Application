package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.BookedClientInfoDTO;
import com.example.fitness_booking_system.dto.TimeSlotCreateDTO;
import com.example.fitness_booking_system.dto.TimeSlotDTO;
import com.example.fitness_booking_system.entities.*;
import com.example.fitness_booking_system.repositories.BookingRepository;
import com.example.fitness_booking_system.repositories.TimeSlotRepository;
import com.example.fitness_booking_system.repositories.TrainerRepository;
import com.example.fitness_booking_system.repositories.TrainingTypeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing time slots in the fitness booking system.
 */
@Service
@RequiredArgsConstructor
public class TimeSlotService {

    /**
     * Repository for accessing time slot data.
     */
    private final TimeSlotRepository timeSlotRepository;
    /**
     * Repository for accessing trainer data.
     */
    private final TrainerRepository trainerRepository;
    /**
     * Repository for accessing training type data.
     */
    private final TrainingTypeRepository trainingTypeRepository;
    /**
     * Repository for accessing booking data.
     */
    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Maps a TimeSlot entity to a TimeSlotDTO.
     *
     * @param timeSlot the TimeSlot entity to map
     * @return the mapped TimeSlotDTO
     */
    private TimeSlotDTO mapToDTO(TimeSlot timeSlot) {
        TimeSlotDTO dto = new TimeSlotDTO();
        dto.setId(timeSlot.getId());
        dto.setTrainerId(timeSlot.getTrainer().getId());
        dto.setTrainerName(timeSlot.getTrainer().getUser().getFullName());
        dto.setTrainingTypeId(timeSlot.getTrainingType().getId());
        dto.setTrainingTypeName(timeSlot.getTrainingType().getName());
        dto.setStartTime(timeSlot.getStartTime());
        dto.setEndTime(timeSlot.getEndTime());
        dto.setCapacity(timeSlot.getCapacity());
        dto.setBookedCount(timeSlot.getBookedCount());
        dto.setStatus(timeSlot.getStatus());
        dto.setAvailableSpots(timeSlot.getCapacity() - timeSlot.getBookedCount());

        return dto;
    }

    /**
     * Retrieves all time slots.
     *
     * @return a list of TimeSlotDTOs
     */
    public List<TimeSlotDTO> getAllTimeSlots() {
        return timeSlotRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves time slots for a specific trainer within a date range.
     *
     * @param trainerId the ID of the trainer
     * @param start     the start date and time of the range
     * @param end       the end date and time of the range
     * @return a list of TimeSlotDTOs for the specified trainer and date range
     */
    public List<TimeSlotDTO> getTimeSlotsByTrainerAndDateRange(Long trainerId, LocalDateTime start, LocalDateTime end) {
        if (!trainerRepository.existsById(trainerId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Треньорът не е намерен с ID: " + trainerId);
        }

        return timeSlotRepository.findByTrainerIdAndStartTimeBetween(trainerId, start, end).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a time slot by its ID.
     *
     * @param id the ID of the time slot
     * @return the TimeSlotDTO for the specified ID
     */
    public TimeSlotDTO getTimeSlotById(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Времевият слот не е намерен с ID: " + id));

        return mapToDTO(timeSlot);
    }

    /**
     * Creates a new time slot based on the provided details.
     *
     * @param createDTO the DTO containing time slot creation details
     * @return the created TimeSlotDTO
     */
    @Transactional
    public TimeSlotDTO createTimeSlot(TimeSlotCreateDTO createDTO) {
        if (createDTO.getStartTime().isAfter(createDTO.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Началният час трябва да е преди крайния час");
        }

        TrainingType trainingType = trainingTypeRepository.findById(createDTO.getTrainingTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Типът тренировка не е намерен с ID: " + createDTO.getTrainingTypeId()));

        long slotDurationMinutes = Duration.between(createDTO.getStartTime(), createDTO.getEndTime()).toMinutes();

        if (slotDurationMinutes != trainingType.getDuration()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Продължителността на слота трябва да съответства на продължителността на тренировката (" +
                            trainingType.getDuration() + " минути)");
        }

        Trainer trainer = trainerRepository.findById(createDTO.getTrainerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Треньорът не е намерен с ID: " + createDTO.getTrainerId()));

        if (timeSlotRepository.hasOverlappingTimeSlot(createDTO.getTrainerId(),
                createDTO.getStartTime(), createDTO.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Има припокриващ се слот за този треньор в избрания период");
        }

        Integer capacity = createDTO.getCapacity();
        if (capacity == null) {
            if (trainingType.getCategory() == TrainingTypeCategory.PERSONAL) {
                capacity = 1;
            } else {
                capacity = trainingType.getMaxClients();
            }
        } else {
            if (trainingType.getCategory() == TrainingTypeCategory.PERSONAL && capacity > 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Персоналните тренировки могат да имат капацитет максимум 1");
            }

            if (trainingType.getCategory() == TrainingTypeCategory.GROUP &&
                    capacity > trainingType.getMaxClients()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Капацитетът не може да надвишава максималния брой клиенти за този тип тренировка (" +
                                trainingType.getMaxClients() + ")");
            }
        }

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setTrainer(trainer);
        timeSlot.setTrainingType(trainingType);
        timeSlot.setStartTime(createDTO.getStartTime());
        timeSlot.setEndTime(createDTO.getEndTime());
        timeSlot.setCapacity(capacity);
        timeSlot.setBookedCount(0);
        timeSlot.setStatus(TimeSlotStatus.AVAILABLE);

        TimeSlot savedTimeSlot = timeSlotRepository.save(timeSlot);
        return mapToDTO(savedTimeSlot);
    }


    /**
     * Cancels a time slot by its ID.
     *
     * @param id the ID of the time slot to cancel
     * @return the cancelled TimeSlotDTO
     */
    @Transactional
    public TimeSlotDTO cancelTimeSlot(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Времевият слот не е намерен с ID: " + id));

        if (timeSlot.getBookedCount() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Не можете да отмените слот, който вече има резервации. Свържете се с клиентите първо.");
        }

        timeSlot.setStatus(TimeSlotStatus.CANCELLED);
        TimeSlot cancelledTimeSlot = timeSlotRepository.save(timeSlot);
        return mapToDTO(cancelledTimeSlot);
    }

    /**
     * Increments the booking count for a time slot.
     *
     * @param timeSlotId the ID of the time slot to increment
     */
    @Transactional
    public void incrementBookingCount(Long timeSlotId) {
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Времевият слот не е намерен с ID: " + timeSlotId));

        try {
            timeSlot.addBooking();
            timeSlotRepository.save(timeSlot);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * Decrements the booking count for a time slot.
     *
     * @param timeSlotId the ID of the time slot to decrement
     */
    @Transactional
    public void decrementBookingCount(Long timeSlotId) {
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Времевият слот не е намерен с ID: " + timeSlotId));

        try {
            timeSlot.removeBooking();
            timeSlotRepository.save(timeSlot);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    /**
     * Retrieves booked client information for a time slot.
     *
     * @param timeSlotId the ID of the time slot
     * @return a list of BookedClientInfoDTOs for the specified time slot
     */
    public List<BookedClientInfoDTO> getClientsForTimeSlot(Long timeSlotId) {
        // Намираме всички активни резервации за този времеви слот
        List<Booking> bookings = bookingRepository.findByTimeSlotIdAndStatus(
                timeSlotId, BookingStatus.CONFIRMED);

        // Конвертираме информацията за клиентите в DTO
        return bookings.stream()
                .map(booking -> {
                    Client client = booking.getClient();
                    User user = client.getUser();

                    return BookedClientInfoDTO.builder()
                            .id(client.getId())
                            .userId(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .phone(user.getPhone())
                            .dateOfBirth(client.getDateOfBirth())
                            .healthInformation(client.getHealthInformation())
                            .fitnessGoals(client.getFitnessGoals())
                            .build();
                })
                .collect(Collectors.toList());
    }

}