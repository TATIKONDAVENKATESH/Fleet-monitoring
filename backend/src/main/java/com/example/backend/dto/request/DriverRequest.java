package com.example.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DriverRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String name;
    @NotBlank @Size(max = 20)
    private String phoneNumber;
    @NotBlank @Size(max = 100)
    private String licenseNumber;
}