package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.BookingCreateDTO;
import com.example.fitness_booking_system.dto.BookingDTO;
import com.example.fitness_booking_system.entities.Booking;
import com.example.fitness_booking_system.entities.BookingStatus;
import com.example.fitness_booking_system.entities.Client;
import com.example.fitness_booking_system.entities.TimeSlot;
import com.example.fitness_booking_system.repositories.BookingRepository;
import com.example.fitness_booking_system.repositories.ClientRepository;
import com.example.fitness_booking_system.repositories.TimeSlotRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing bookings in the fitness booking system.
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    /**
     * Repository for accessing booking data.
     */
    private final BookingRepository bookingRepository;
    /**
     * Repository for accessing client data.
     */
    private final ClientRepository clientRepository;
    /**
     * Repository for accessing time slot data.
     */
    private final TimeSlotRepository timeSlotRepository;
    /**
     * Service for managing time slots.
     */
    private final TimeSlotService timeSlotService;

    private final EmailService emailService;

    /**
     * Date and time formatters for formatting booking dates and times.
     */
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Maps a Booking entity to a BookingDTO.
     *
     * @param booking the Booking entity to map
     * @return the mapped BookingDTO
     */
    private BookingDTO mapToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setClientId(booking.getClient().getId());
        dto.setClientName(booking.getClient().getUser().getFullName());
        dto.setTimeSlotId(booking.getTimeSlot().getId());
        dto.setTrainerId(booking.getTimeSlot().getTrainer().getId());
        dto.setTrainerName(booking.getTimeSlot().getTrainer().getUser().getFullName());
        dto.setTrainingTypeName(booking.getTimeSlot().getTrainingType().getName());
        dto.setStartTime(booking.getTimeSlot().getStartTime());
        dto.setEndTime(booking.getTimeSlot().getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setFormattedDate(booking.getTimeSlot().getStartTime().format(DATE_FORMATTER));
        dto.setFormattedTime(
                booking.getTimeSlot().getStartTime().format(TIME_FORMATTER) + " - " +
                        booking.getTimeSlot().getEndTime().format(TIME_FORMATTER)
        );

        return dto;
    }

    /**
     * Retrieves all bookings for a specific client.
     *
     * @param clientId the ID of the client whose bookings are to be retrieved
     * @return a list of BookingDTOs for the specified client
     */
    public List<BookingDTO> getClientBookings(Long clientId) {
        if (!clientRepository.existsById(clientId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Клиентът не е намерен с ID: " + clientId);
        }

        return bookingRepository.findByClientId(clientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new booking for a client.
     *
     * @param clientId  the ID of the client making the booking
     * @param createDTO the DTO containing booking details
     * @return the created BookingDTO
     */
    @Transactional
    public BookingDTO createBooking(Long clientId, BookingCreateDTO createDTO) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Клиентът не е намерен с ID: " + clientId));

        TimeSlot timeSlot = timeSlotRepository.findById(createDTO.getTimeSlotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Времевият слот не е намерен с ID: " + createDTO.getTimeSlotId()));

        if (!timeSlot.canBeBooked()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Този времеви слот вече е зает или отменен");
        }

        // Проверяваме само за активни резервации (не отменени)
        if (bookingRepository.existsByClientIdAndTimeSlotIdAndStatusNot(clientId, createDTO.getTimeSlotId(), BookingStatus.CANCELLED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Вече имате резервация за този времеви слот");
        }

        if (timeSlot.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Не можете да резервирате слот в миналото");
        }

        Booking booking = new Booking();
        booking.setClient(client);
        booking.setTimeSlot(timeSlot);
        booking.setStatus(BookingStatus.CONFIRMED);

        timeSlotService.incrementBookingCount(timeSlot.getId());

        Booking savedBooking = bookingRepository.save(booking);

        // Изпращане на имейли
        String clientEmail = client.getUser().getEmail();
        String clientName = client.getUser().getFullName();
        String trainerEmail = timeSlot.getTrainer().getUser().getEmail();
        String trainerName = timeSlot.getTrainer().getUser().getFullName();
        String trainingType = timeSlot.getTrainingType().getName();
        String date = timeSlot.getStartTime().format(DATE_FORMATTER);
        String time = timeSlot.getStartTime().format(TIME_FORMATTER) + " - " +
                timeSlot.getEndTime().format(TIME_FORMATTER);

        // Изпращане на потвърждение на клиента
        emailService.sendBookingConfirmationToClient(
                clientEmail, clientName, trainingType, trainerName, date, time
        );

        // Изпращане на уведомление на треньора
        emailService.sendBookingNotificationToTrainer(
                trainerEmail, trainerName, clientName, trainingType, date, time
        );

        return mapToDTO(savedBooking);
    }

    /**
     * Cancels a booking by its ID.
     *
     * @param id the ID of the booking to be cancelled
     * @return the cancelled BookingDTO
     */
    @Transactional
    public BookingDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Резервацията не е намерена с ID: " + id));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Резервацията вече е отменена");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Не можете да отмените приключена резервация");
        }

        // Запазваме информацията за имейлите преди да отменим резервацията
        String clientEmail = booking.getClient().getUser().getEmail();
        String clientName = booking.getClient().getUser().getFullName();
        String trainerEmail = booking.getTimeSlot().getTrainer().getUser().getEmail();
        String trainerName = booking.getTimeSlot().getTrainer().getUser().getFullName();
        String trainingType = booking.getTimeSlot().getTrainingType().getName();
        String date = booking.getTimeSlot().getStartTime().format(DATE_FORMATTER);
        String time = booking.getTimeSlot().getStartTime().format(TIME_FORMATTER) + " - " +
                booking.getTimeSlot().getEndTime().format(TIME_FORMATTER);

        booking.cancel();

        timeSlotService.decrementBookingCount(booking.getTimeSlot().getId());

        Booking cancelledBooking = bookingRepository.save(booking);

        // Изпращане на имейли за отмяна
        emailService.sendCancellationNotificationToClient(
                clientEmail, clientName, trainingType, trainerName, date, time
        );

        emailService.sendCancellationNotificationToTrainer(
                trainerEmail, trainerName, clientName, trainingType, date, time
        );

        return mapToDTO(cancelledBooking);
    }
}