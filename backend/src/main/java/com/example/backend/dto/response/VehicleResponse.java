package com.example.backend.dto.response;

import com.example.backend.constant.VehicleStatus;
import com.example.backend.constant.VehicleType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VehicleResponse {
    private Long id;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String registrationNumber;
    private Long driverId;
    private String driverName;
    private VehicleStatus status;
    private LocalDateTime createdAt;
}