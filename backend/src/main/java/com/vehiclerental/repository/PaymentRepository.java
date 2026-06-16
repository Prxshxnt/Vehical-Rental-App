package com.vehiclerental.repository;

import com.vehiclerental.entity.Payment;
import com.vehiclerental.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    long countByPaymentStatus(PaymentStatus status);
}
