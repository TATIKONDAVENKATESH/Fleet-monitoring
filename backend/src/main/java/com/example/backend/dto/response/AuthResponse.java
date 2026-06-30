package com.example.backend.dto.response;

import com.example.backend.constant.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn;

    // Flattened user fields — matches frontend AuthContext expectations
    private Long userId;
    private String name;
    private String email;
    private Role role;
}