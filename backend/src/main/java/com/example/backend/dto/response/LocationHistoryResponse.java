package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LocationHistoryResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleNumber;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private LocalDateTime recordedAt;
}