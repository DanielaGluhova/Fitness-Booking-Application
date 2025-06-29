package com.example.fitness_booking_system.services;

import com.example.fitness_booking_system.dto.ClientDTO;
import com.example.fitness_booking_system.dto.ProfileUpdateDTO;
import com.example.fitness_booking_system.entities.Client;
import com.example.fitness_booking_system.entities.User;
import com.example.fitness_booking_system.repositories.ClientRepository;
import com.example.fitness_booking_system.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ClientService clientService;

    private Client client;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setFullName("Иван Петров");
        user.setEmail("ivan@example.com");
        user.setPhone("0888123456");

        client = new Client();
        client.setId(1L);
        client.setUser(user);
        client.setDateOfBirth(LocalDate.of(1990, 5, 10));
        client.setHealthInformation("Няма заболявания");
        client.setFitnessGoals("Отслабване");
    }

    @Test
    void shouldGetClientProfileSuccessfully() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        ClientDTO result = clientService.getClientProfile(1L);

        assertNotNull(result);
        assertEquals(client.getId(), result.getId());
        assertEquals(user.getFullName(), result.getFullName());
        assertEquals(user.getEmail(), result.getEmail());
    }

    @Test
    void shouldThrowNotFoundWhenGettingNonExistentClientProfile() {
        when(clientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> clientService.getClientProfile(1L));
    }

    @Test
    void shouldUpdateClientProfileSuccessfully() {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setFullName("Иван Иванов");
        updateDTO.setPhone("0888999888");
        updateDTO.setDateOfBirth("1992-03-15");
        updateDTO.setHealthInformation("Алергии");
        updateDTO.setFitnessGoals("Покачване на мускулна маса");

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(clientRepository.save(any(Client.class))).thenAnswer(i -> i.getArguments()[0]);

        ClientDTO result = clientService.updateClientProfile(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Иван Иванов", result.getFullName());
        assertEquals("0888999888", result.getPhone());
        assertEquals(LocalDate.of(1992, 3, 15), result.getDateOfBirth());
        assertEquals("Алергии", result.getHealthInformation());
        assertEquals("Покачване на мускулна маса", result.getFitnessGoals());

        verify(userRepository).save(user);
        verify(clientRepository).save(client);
    }

    @Test
    void shouldUpdateOnlyProvidedFieldsInProfile() {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setPhone("1122334455");
        updateDTO.setFitnessGoals("Кардио издръжливост");

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(clientRepository.save(any(Client.class))).thenAnswer(i -> i.getArguments()[0]);

        ClientDTO result = clientService.updateClientProfile(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Иван Петров", result.getFullName());
        assertEquals("1122334455", result.getPhone());
        assertEquals("Кардио издръжливост", result.getFitnessGoals());
        assertEquals("Няма заболявания", result.getHealthInformation());
    }


    @Test
    void shouldThrowNotFoundWhenUpdatingNonExistentClientProfile() {
        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setFullName("Няма значение");

        when(clientRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> clientService.updateClientProfile(1L, updateDTO));
    }
}