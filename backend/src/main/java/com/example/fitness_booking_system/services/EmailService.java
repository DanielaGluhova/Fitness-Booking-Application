package com.example.fitness_booking_system.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    public void sendBookingConfirmationToClient(String clientEmail, String clientName,
                                                String trainingType, String trainerName,
                                                String date, String time) {
        var subject = "Потвърждение за резервация - Fitness Booking System";
        var message = String.format(
                "Уважаеми/а %s,\n\n" +
                        "Вашата резервация беше успешно направена!\n\n" +
                        "Детайли за резервацията:\n" +
                        "• Вид тренировка: %s\n" +
                        "• Треньор: %s\n" +
                        "• Дата: %s\n" +
                        "• Час: %s\n\n" +
                        "Моля, бъдете навреме за тренировката си.\n\n" +
                        "С най-добри пожелания,\n" +
                        "Екипът на Fitness Booking System",
                clientName, trainingType, trainerName, date, time
        );

        sendEmail(clientEmail, subject, message);
    }

    public void sendBookingNotificationToTrainer(String trainerEmail, String trainerName,
                                                 String clientName, String trainingType,
                                                 String date, String time) {
        var subject = "Нова резервация - Fitness Booking System";
        var message = String.format(
                "Уважаеми треньор %s,\n\n" +
                        "Имате нова резервация за тренировка!\n\n" +
                        "Детайли за резервацията:\n" +
                        "• Клиент: %s\n" +
                        "• Вид тренировка: %s\n" +
                        "• Дата: %s\n" +
                        "• Час: %s\n\n" +
                        "Моля, бъдете подготвени за тренировката.\n\n" +
                        "С най-добри пожелания,\n" +
                        "Екипът на Fitness Booking System",
                trainerName, clientName, trainingType, date, time
        );

        sendEmail(trainerEmail, subject, message);
    }

    public void sendCancellationNotificationToClient(String clientEmail, String clientName,
                                                     String trainingType, String trainerName,
                                                     String date, String time) {
        var subject = "Отмяна на резервация - Fitness Booking System";
        var message = String.format(
                "Уважаеми/а %s,\n\n" +
                        "Вашата резервация беше успешно отменена.\n\n" +
                        "Детайли за отменената резервация:\n" +
                        "• Вид тренировка: %s\n" +
                        "• Треньор: %s\n" +
                        "• Дата: %s\n" +
                        "• Час: %s\n\n" +
                        "Ако желаете да направите нова резервация, моля посетете нашата система.\n\n" +
                        "С най-добри пожелания,\n" +
                        "Екипът на Fitness Booking System",
                clientName, trainingType, trainerName, date, time
        );

        sendEmail(clientEmail, subject, message);
    }

    public void sendCancellationNotificationToTrainer(String trainerEmail, String trainerName,
                                                      String clientName, String trainingType,
                                                      String date, String time) {
        var subject = "Отмяна на резервация - Fitness Booking System";
        var message = String.format(
                "Уважаеми треньор %s,\n\n" +
                        "Резервация за ваша тренировка беше отменена.\n\n" +
                        "Детайли за отменената резервация:\n" +
                        "• Клиент: %s\n" +
                        "• Вид тренировка: %s\n" +
                        "• Дата: %s\n" +
                        "• Час: %s\n\n" +
                        "Времевият слот сега е отново свободен за резервация.\n\n" +
                        "С най-добри пожелания,\n" +
                        "Екипът на Fitness Booking System",
                trainerName, clientName, trainingType, date, time
        );

        sendEmail(trainerEmail, subject, message);
    }

    private void sendEmail(String recipient, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(sender);
            mailMessage.setTo(recipient);
            mailMessage.setText(message);
            mailMessage.setSubject(subject);

            javaMailSender.send(mailMessage);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email to: " + recipient, e);
        }
    }
}