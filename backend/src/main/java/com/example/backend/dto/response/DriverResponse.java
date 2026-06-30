package com.example.backend.dto.response;

import com.example.backend.constant.DriverStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DriverResponse {
    private Long id;
    private String name;
    private String phoneNumber;
    private String licenseNumber;
    private DriverStatus status;
    private LocalDateTime createdAt;
}