package com.example.backend.dto.response;

import com.example.backend.constant.Role;
import com.example.backend.constant.UserStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
}