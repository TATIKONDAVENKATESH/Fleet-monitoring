package com.example.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LocationRequest {
    @NotNull
    private Long vehicleId;
    @NotNull @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double latitude;
    @NotNull @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double longitude;
    @DecimalMin("0.0") @DecimalMax("300.0")
    private Double speed;
    @DecimalMin("0.0") @DecimalMax("360.0")
    private Double heading;
}