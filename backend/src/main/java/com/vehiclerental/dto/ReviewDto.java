package com.vehiclerental.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReviewDto {
    private Long id;
    @NotNull private Long vehicleId;
    @NotNull private Long bookingId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    private String comment;
    private String userName;
    private LocalDateTime createdAt;
}
