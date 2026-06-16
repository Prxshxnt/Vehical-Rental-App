package com.vehiclerental.service;

import com.vehiclerental.dto.PaymentDto;
import com.vehiclerental.entity.Booking;
import com.vehiclerental.entity.Payment;
import com.vehiclerental.enums.BookingStatus;
import com.vehiclerental.enums.PaymentStatus;
import com.vehiclerental.repository.BookingRepository;
import com.vehiclerental.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Transactional
    public PaymentDto processPayment(PaymentDto dto) {
        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (paymentRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new RuntimeException("Payment already processed for this booking");
        }

        // Simulate payment: 90% success rate
        boolean success = Math.random() > 0.1;
        PaymentStatus status = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .paymentStatus(status)
                .paymentMethod(dto.getPaymentMethod())
                .transactionId(UUID.randomUUID().toString().substring(0, 16).toUpperCase())
                .paidAt(success ? LocalDateTime.now() : null)
                .build();

        if (success) {
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        } else {
            booking.setStatus(BookingStatus.PENDING);
            bookingRepository.save(booking);
        }

        Payment saved = paymentRepository.save(payment);
        return toDto(saved);
    }

    public PaymentDto getPaymentByBooking(Long bookingId) {
        Payment p = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return toDto(p);
    }

    private PaymentDto toDto(Payment p) {
        return PaymentDto.builder()
                .id(p.getId()).bookingId(p.getBooking().getId())
                .amount(p.getAmount()).paymentStatus(p.getPaymentStatus())
                .paymentMethod(p.getPaymentMethod()).transactionId(p.getTransactionId())
                .paidAt(p.getPaidAt()).build();
    }
}
