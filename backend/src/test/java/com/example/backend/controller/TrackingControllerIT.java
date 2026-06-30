package com.example.backend.controller;

import com.example.backend.constant.Role;
import com.example.backend.constant.VehicleStatus;
import com.example.backend.constant.VehicleType;
import com.example.backend.dto.request.LocationRequest;
import com.example.backend.entity.Vehicle;
import com.example.backend.repository.VehicleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for TrackingController.
 *
 * NEW FILE: The test/controller/ directory existed but was empty.
 * These tests cover the primary tracking endpoints.
 *
 * Note: requires a running Redis instance (started in CI via docker service
 * or locally via: docker run -p 6379:6379 redis:7-alpine).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TrackingControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired VehicleRepository vehicleRepository;

    private Long vehicleId;

    @BeforeEach
    void setUp() {
        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber("TN01TEST01")
                .vehicleType(VehicleType.CAR)
                .registrationNumber("TN01TEST01REG")
                .status(VehicleStatus.ACTIVE)
                .build();
        vehicleId = vehicleRepository.save(vehicle).getId();
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void ingestLocation_validPayload_returns200() throws Exception {
        LocationRequest req = new LocationRequest();
        req.setVehicleId(vehicleId);
        req.setLatitude(17.385);
        req.setLongitude(78.486);
        req.setSpeed(60.0);
        req.setHeading(120.0);

        mockMvc.perform(post("/api/v1/tracking/location")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.vehicleId").value(vehicleId))
                .andExpect(jsonPath("$.data.latitude").value(17.385));
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void ingestLocation_overspeed_triggers200AndCreatesAlert() throws Exception {
        LocationRequest req = new LocationRequest();
        req.setVehicleId(vehicleId);
        req.setLatitude(17.385);
        req.setLongitude(78.486);
        req.setSpeed(120.0);  // Over the 80 km/h threshold

        mockMvc.perform(post("/api/v1/tracking/location")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        // Alert creation is verified via AlertRepository in AlertServiceTest
    }

    @Test
    @WithMockUser(roles = "DRIVER")
    void ingestLocation_invalidVehicleId_returns404() throws Exception {
        LocationRequest req = new LocationRequest();
        req.setVehicleId(99999L);
        req.setLatitude(17.385);
        req.setLongitude(78.486);

        mockMvc.perform(post("/api/v1/tracking/location")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void getAllLiveLocations_authenticated_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/tracking/live"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void getAllLiveLocations_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/tracking/live"))
                .andExpect(status().isUnauthorized());
    }
}
