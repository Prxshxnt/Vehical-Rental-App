package com.vehiclerental.controller;

import com.vehiclerental.dto.PaymentDto;
import com.vehiclerental.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDto> processPayment(@Valid @RequestBody PaymentDto dto) {
        return ResponseEntity.ok(paymentService.processPayment(dto));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentDto> getByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBooking(bookingId));
    }
}
