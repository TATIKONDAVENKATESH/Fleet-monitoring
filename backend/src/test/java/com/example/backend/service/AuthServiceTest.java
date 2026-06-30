package com.example.backend.service;

import com.example.backend.constant.Role;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.User;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.InvalidTokenException;
import com.example.backend.repository.RefreshTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "jwtExpirationMs", 3_600_000L);
        ReflectionTestUtils.setField(authService, "refreshExpirationMs", 604_800_000L);
    }

    @Test
    void register_newUser_returnsTokens() {
        RegisterRequest req = new RegisterRequest();
        req.setName("Venky");
        req.setEmail("venky@test.com");
        req.setPassword("secret123");
        req.setRole(Role.MANAGER);

        User saved = User.builder().id(1L).name("Venky").email("venky@test.com").role(Role.MANAGER).build();

        when(userRepository.existsByEmail("venky@test.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(saved);
        when(jwtTokenProvider.generateToken(saved)).thenReturn("access-token");
        when(refreshTokenRepository.findByUser(saved)).thenReturn(Optional.empty());
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthResponse resp = authService.register(req);

        assertThat(resp.getAccessToken()).isEqualTo("access-token");
        assertThat(resp.getUserId()).isEqualTo(1L);
        assertThat(resp.getEmail()).isEqualTo("venky@test.com");
        assertThat(resp.getRole()).isEqualTo(Role.MANAGER);
    }

    @Test
    void register_duplicateEmail_throws() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("dup@test.com");
        when(userRepository.existsByEmail("dup@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void login_badCredentials_throws() {
        LoginRequest req = new LoginRequest();
        req.setEmail("x@test.com");
        req.setPassword("wrong");

        doThrow(new BadCredentialsException("bad"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void refresh_expiredToken_throws() {
        com.example.backend.dto.request.RefreshTokenRequest req = new com.example.backend.dto.request.RefreshTokenRequest();
        req.setRefreshToken("expired-token");

        User user = User.builder().id(2L).build();
        RefreshToken expired = RefreshToken.builder()
                .token("expired-token")
                .user(user)
                .expiresAt(Instant.now().minusSeconds(60))
                .build();

        when(refreshTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.refresh(req))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("expired");
    }
}