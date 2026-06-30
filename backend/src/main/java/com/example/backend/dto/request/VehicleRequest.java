package com.example.backend.dto.request;

import com.example.backend.constant.VehicleType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class VehicleRequest {
    @NotBlank @Size(max = 50)
    private String vehicleNumber;
    @NotNull
    private VehicleType vehicleType;
    @NotBlank @Size(max = 100)
    private String registrationNumber;
    private Long driverId;
}