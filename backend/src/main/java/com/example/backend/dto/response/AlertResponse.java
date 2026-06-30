package com.example.backend.dto.response;

import com.example.backend.constant.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleNumber;
    private AlertType alertType;
    private String message;
    private Boolean acknowledged;
    private Long geofenceId;
    private String geofenceName;
    private LocalDateTime createdAt;
    private LocalDateTime acknowledgedAt;
}