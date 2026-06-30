package com.example.backend.service;

import com.example.backend.constant.AlertType;
import com.example.backend.constant.VehicleStatus;
import com.example.backend.dto.request.LocationRequest;
import com.example.backend.dto.response.AlertResponse;
import com.example.backend.dto.response.LiveLocationResponse;
import com.example.backend.entity.Alert;
import com.example.backend.entity.Vehicle;
import com.example.backend.mapper.AlertMapper;
import com.example.backend.mapper.LocationHistoryMapper;
import com.example.backend.redis.LiveVehicleLocation;
import com.example.backend.redis.RedisKeyConstants;
import com.example.backend.redis.RedisPublisher;
import com.example.backend.repository.LocationHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackingServiceTest {

    @Mock VehicleService vehicleService;
    @Mock AlertService alertService;
    @Mock GeofenceService geofenceService;
    @Mock LocationHistoryRepository locationHistoryRepository;
    @Mock LocationHistoryMapper locationHistoryMapper;
    @Mock AlertMapper alertMapper;
    @Mock RedisTemplate<String, Object> redisTemplate;
    @Mock RedisPublisher redisPublisher;
    @Mock ValueOperations<String, Object> valueOps;

    @InjectMocks TrackingService trackingService;

    private Vehicle testVehicle;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(trackingService, "overspeedThreshold", 80.0);

        testVehicle = Vehicle.builder()
                .id(1L)
                .vehicleNumber("TN01AB1234")
                .status(VehicleStatus.ACTIVE)
                .build();

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOps);
        lenient().when(vehicleService.getVehicle(1L)).thenReturn(testVehicle);
        lenient().when(geofenceService.findAllActive()).thenReturn(java.util.List.of());
    }

    @Test
    void processLocation_normalSpeed_noOverspeedAlert() {
        LocationRequest req = new LocationRequest();
        req.setVehicleId(1L);
        req.setLatitude(17.385);
        req.setLongitude(78.486);
        req.setSpeed(60.0);
        req.setHeading(120.0);

        when(locationHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        LiveLocationResponse response = trackingService.processLocation(req);

        assertThat(response.getVehicleNumber()).isEqualTo("TN01AB1234");
        assertThat(response.getLatitude()).isEqualTo(17.385);
        verify(alertService, never()).createAlert(any(), eq(AlertType.OVERSPEED), any(), any());
        verify(redisPublisher, times(1)).publish(eq(RedisKeyConstants.LOCATION_CHANNEL), any());
    }

    @Test
    void processLocation_overSpeed_createsAlert() {
        LocationRequest req = new LocationRequest();
        req.setVehicleId(1L);
        req.setLatitude(17.385);
        req.setLongitude(78.486);
        req.setSpeed(95.0);

        Alert mockAlert = Alert.builder().id(10L).alertType(AlertType.OVERSPEED).vehicle(testVehicle).message("overspeed").build();
        AlertResponse mockAlertResp = AlertResponse.builder().id(10L).alertType(AlertType.OVERSPEED).build();

        when(locationHistoryRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(alertService.createAlert(eq(testVehicle), eq(AlertType.OVERSPEED), anyString(), isNull()))
                .thenReturn(mockAlert);
        when(alertMapper.toResponse(mockAlert)).thenReturn(mockAlertResp);

        trackingService.processLocation(req);

        verify(alertService).createAlert(eq(testVehicle), eq(AlertType.OVERSPEED), anyString(), isNull());
        verify(redisPublisher).publish(eq(RedisKeyConstants.ALERT_CHANNEL), eq(mockAlertResp));
    }

    @Test
    void haversineMeters_samePoint_returnsZero() {
        double dist = TrackingService.haversineMeters(17.385, 78.486, 17.385, 78.486);
        assertThat(dist).isLessThan(0.001);
    }

    @Test
    void haversineMeters_knownDistance_approximatelyCorrect() {
        // Delhi (28.6139, 77.2090) to Mumbai (19.0760, 72.8777) ≈ 1150 km
        double dist = TrackingService.haversineMeters(28.6139, 77.2090, 19.0760, 72.8777);
        assertThat(dist).isBetween(1_100_000.0, 1_200_000.0);
    }
}