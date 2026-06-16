package com.vehiclerental.dto;

import com.vehiclerental.enums.VehicleStatus;
import com.vehiclerental.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VehicleDto {
    private Long id;
    @NotBlank private String name;
    @NotNull  private VehicleType type;
    private String brand;
    private String model;
    private Integer year;
    @NotNull  private BigDecimal pricePerDay;
    private VehicleStatus status;
    private Double locationLat;
    private Double locationLng;
    private String imageUrl;
    private String description;
    private Integer seats;
    private String fuelType;
    private BigDecimal rating;
}
