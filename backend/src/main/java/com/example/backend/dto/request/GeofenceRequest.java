package com.example.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class GeofenceRequest {
    @NotBlank @Size(max = 255)
    private String name;
    @NotNull @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double centerLatitude;
    @NotNull @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double centerLongitude;
    @NotNull @Positive
    private Double radiusMeters;
    private Boolean active = true;
}