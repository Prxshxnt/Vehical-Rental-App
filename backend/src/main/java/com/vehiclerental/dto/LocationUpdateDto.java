package com.vehiclerental.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LocationUpdateDto {
    @NotNull private Double lat;
    @NotNull private Double lng;
}
