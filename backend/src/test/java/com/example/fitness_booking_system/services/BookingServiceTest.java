package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.BookingCreateDTO;
import com.example.fitness_booking_system.dto.BookingDTO;
import com.example.fitness_booking_system.entities.*;
import com.example.fitness_booking_system.repositories.BookingRepository;
import com.example.fitness_booking_system.repositories.ClientRepository;
import com.example.fitness_booking_system.repositories.TimeSlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private TimeSlotRepository timeSlotRepository;

    @Mock
    private TimeSlotService timeSlotService;

    @InjectMocks
    private BookingService bookingService;

    private Client client;
    private User clientUser;
    private Trainer trainer;
    private User trainerUser;
    private TimeSlot timeSlot;
    private Booking booking;
    private TrainingType trainingType;

    @BeforeEach
    void setUp() {
        clientUser = new User();
        clientUser.setFullName("Test Client");

        client = new Client();
        client.setId(1L);
        client.setUser(clientUser);

        trainerUser = new User();
        trainerUser.setFullName("Test Trainer");

        trainer = new Trainer();
        trainer.setId(1L);
        trainer.setUser(trainerUser);

        trainingType = new TrainingType();
        trainingType.setName("Yoga");

        timeSlot = new TimeSlot();
        timeSlot.setId(1L);
        timeSlot.setTrainer(trainer);
        timeSlot.setTrainingType(trainingType);
        timeSlot.setStartTime(LocalDateTime.now().plusHours(1));
        timeSlot.setEndTime(LocalDateTime.now().plusHours(2));
        timeSlot.setBookedCount(0);
        timeSlot.setCapacity(1);


        booking = new Booking();
        booking.setId(1L);
        booking.setClient(client);
        booking.setTimeSlot(timeSlot);
        booking.setStatus(BookingStatus.CONFIRMED);
    }

    @Test
    void shouldGetClientBookings() {
        when(clientRepository.existsById(1L)).thenReturn(true);
        when(bookingRepository.findByClientId(1L)).thenReturn(Collections.singletonList(booking));

        List<BookingDTO> result = bookingService.getClientBookings(1L);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(booking.getId(), result.get(0).getId());
        verify(bookingRepository).findByClientId(1L);
    }

    @Test
    void shouldThrowNotFoundWhenGettingBookingsForNonExistentClient() {
        when(clientRepository.existsById(1L)).thenReturn(false);
        assertThrows(ResponseStatusException.class, () -> bookingService.getClientBookings(1L));
    }


    @Test
    void shouldCreateBookingSuccessfully() {
        BookingCreateDTO createDTO = new BookingCreateDTO();
        createDTO.setTimeSlotId(1L);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
        when(bookingRepository.existsByClientIdAndTimeSlotId(1L, 1L)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingDTO result = bookingService.createBooking(1L, createDTO);

        assertNotNull(result);
        assertEquals(booking.getId(), result.getId());
        verify(timeSlotService).incrementBookingCount(1L);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void shouldThrowConflictWhenTimeSlotIsFull() {
        BookingCreateDTO createDTO = new BookingCreateDTO();
        createDTO.setTimeSlotId(1L);

        timeSlot.setBookedCount(1);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));

        assertThrows(ResponseStatusException.class, () -> bookingService.createBooking(1L, createDTO));
    }

    @Test
    void shouldThrowConflictWhenBookingAlreadyExists() {
        BookingCreateDTO createDTO = new BookingCreateDTO();
        createDTO.setTimeSlotId(1L);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
        when(bookingRepository.existsByClientIdAndTimeSlotId(1L, 1L)).thenReturn(true);

        assertThrows(ResponseStatusException.class, () -> bookingService.createBooking(1L, createDTO));
    }

    @Test
    void shouldThrowBadRequestWhenBookingInThePast() {
        BookingCreateDTO createDTO = new BookingCreateDTO();
        createDTO.setTimeSlotId(1L);
        timeSlot.setStartTime(LocalDateTime.now().minusHours(1));

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));

        assertThrows(ResponseStatusException.class, () -> bookingService.createBooking(1L, createDTO));
    }

    @Test
    void shouldCancelBookingSuccessfully() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);

        BookingDTO result = bookingService.cancelBooking(1L);

        assertNotNull(result);
        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        verify(timeSlotService).decrementBookingCount(booking.getTimeSlot().getId());
        verify(bookingRepository).save(booking);
    }

    @Test
    void shouldThrowConflictWhenCancellingAlreadyCancelledBooking() {
        booking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(ResponseStatusException.class, () -> bookingService.cancelBooking(1L));
    }

    @Test
    void shouldThrowConflictWhenCancellingCompletedBooking() {
        booking.setStatus(BookingStatus.COMPLETED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(ResponseStatusException.class, () -> bookingService.cancelBooking(1L));
    }

    @Test
    void shouldThrowNotFoundWhenCancellingNonExistentBooking() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> bookingService.cancelBooking(1L));
    }
}