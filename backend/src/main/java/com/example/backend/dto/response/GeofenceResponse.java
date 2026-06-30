package com.example.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class GeofenceResponse {
    private Long id;
    private String name;
    private Double centerLatitude;
    private Double centerLongitude;
    private Double radiusMeters;
    private Boolean active;
    private LocalDateTime createdAt;
}