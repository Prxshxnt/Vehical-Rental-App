package com.vehiclerental.dto;

import com.vehiclerental.enums.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentDto {
    private Long id;
    @NotNull private Long bookingId;
    private BigDecimal amount;
    private PaymentStatus paymentStatus;
    @NotBlank private String paymentMethod;
    private String transactionId;
    private LocalDateTime paidAt;
}
