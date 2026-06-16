package com.vehiclerental.service;

import com.vehiclerental.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmation(String to, String userName, String vehicleName, Booking booking) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("Booking Confirmation - Vehicle Rental");
            msg.setText(String.format(
                    "Dear %s,\n\nYour booking has been placed successfully!\n\n" +
                    "Vehicle: %s\nStart: %s\nEnd: %s\nTotal: ₹%.2f\n\n" +
                    "Status: PENDING — complete payment to confirm.\n\nThank you!",
                    userName, vehicleName,
                    booking.getStartDate(), booking.getEndDate(),
                    booking.getTotalPrice()));
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Could not send booking email: {}", e.getMessage());
        }
    }

    @Async
    public void sendPaymentConfirmation(String to, String userName, String transactionId, double amount) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject("Payment Confirmation - Vehicle Rental");
            msg.setText(String.format(
                    "Dear %s,\n\nPayment of ₹%.2f received!\nTransaction ID: %s\n\nEnjoy your ride!",
                    userName, amount, transactionId));
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Could not send payment email: {}", e.getMessage());
        }
    }
}
