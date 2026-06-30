package com.example.backend.redis;

import com.example.backend.constant.VehicleStatus;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LiveVehicleLocation implements Serializable {
    private Long vehicleId;
    private String vehicleNumber;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private VehicleStatus status;
    private LocalDateTime timestamp;
}