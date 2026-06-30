package com.example.backend.dto.response;

import com.example.backend.constant.VehicleStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class LiveLocationResponse {
    private Long vehicleId;
    private String vehicleNumber;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private VehicleStatus status;
    private LocalDateTime timestamp;
}