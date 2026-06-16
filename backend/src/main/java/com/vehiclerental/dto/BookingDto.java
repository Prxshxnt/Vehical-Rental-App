package com.vehiclerental.dto;

import com.vehiclerental.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookingDto {
    private Long id;
    @NotNull private Long vehicleId;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String notes;
    private LocalDateTime createdAt;
    // enriched fields
    private String vehicleName;
    private String vehicleImageUrl;
    private String userName;
}
