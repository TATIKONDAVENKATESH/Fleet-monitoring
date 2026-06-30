package com.example.backend.service;

import com.example.backend.constant.AlertType;
import com.example.backend.constant.VehicleStatus;
import com.example.backend.dto.request.LocationRequest;
import com.example.backend.dto.response.LiveLocationResponse;
import com.example.backend.dto.response.LocationHistoryResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entity.Alert;
import com.example.backend.entity.Geofence;
import com.example.backend.entity.LocationHistory;
import com.example.backend.entity.Vehicle;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.AlertMapper;
import com.example.backend.mapper.LocationHistoryMapper;
import com.example.backend.redis.LiveVehicleLocation;
import com.example.backend.redis.RedisKeyConstants;
import com.example.backend.redis.RedisPublisher;
import com.example.backend.repository.LocationHistoryRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingService {

    private final VehicleService vehicleService;
    private final VehicleRepository vehicleRepository;   // BUG FIX T1: need repo to explicitly save status change
    private final AlertService alertService;
    private final GeofenceService geofenceService;
    private final LocationHistoryRepository locationHistoryRepository;
    private final LocationHistoryMapper locationHistoryMapper;
    private final AlertMapper alertMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisPublisher redisPublisher;

    @Value("${app.fleet.overspeed-threshold-kmh:80}")
    private double overspeedThreshold;

    @Transactional
    public LiveLocationResponse processLocation(LocationRequest request) {
        Vehicle vehicle = vehicleService.getVehicle(request.getVehicleId());

        // BUG FIX T1: Explicitly save the status transition ACTIVE
        if (vehicle.getStatus() != VehicleStatus.ACTIVE) {
            vehicle.setStatus(VehicleStatus.ACTIVE);
            vehicleRepository.save(vehicle);
        }

        persistHistory(vehicle, request);

        LiveVehicleLocation liveLocation = buildLiveLocation(vehicle, request);
        cacheLocation(vehicle.getId(), liveLocation);
        updateLastSeen(vehicle.getId());

        if (request.getSpeed() != null && request.getSpeed() > overspeedThreshold) {
            Alert alert = alertService.createAlert(vehicle, AlertType.OVERSPEED,
                    String.format("Vehicle %s exceeded speed limit: %.1f km/h",
                            vehicle.getVehicleNumber(), request.getSpeed()), null);
            redisPublisher.publish(RedisKeyConstants.ALERT_CHANNEL, alertMapper.toResponse(alert));
        }

        checkGeofences(vehicle, request.getLatitude(), request.getLongitude());

        redisPublisher.publish(RedisKeyConstants.LOCATION_CHANNEL, liveLocation);

        log.debug("Processed location for vehicle {}: lat={}, lon={}",
                vehicle.getVehicleNumber(), request.getLatitude(), request.getLongitude());

        return toLiveResponse(liveLocation);
    }

    public LiveLocationResponse getLiveLocation(Long vehicleId) {
        vehicleService.getVehicle(vehicleId);
        LiveVehicleLocation cached = (LiveVehicleLocation) redisTemplate.opsForValue()
                .get(RedisKeyConstants.vehicleLocation(vehicleId));
        if (cached == null) {
            throw new ResourceNotFoundException("No live location data for vehicle: " + vehicleId);
        }
        return toLiveResponse(cached);
    }

    public List<LiveVehicleLocation> getAllLiveLocations() {
        List<LiveVehicleLocation> result = new ArrayList<>();

        ScanOptions options = ScanOptions.scanOptions()
                .match(RedisKeyConstants.VEHICLE_LOCATION_PREFIX + "[0-9]*")
                .count(200)
                .build();

        try (var cursor = redisTemplate.scan(options)) {
            while (cursor.hasNext()) {
                String key = cursor.next();
                Object val = redisTemplate.opsForValue().get(key);
                if (val instanceof LiveVehicleLocation loc) {
                    result.add(loc);
                }
            }
        } catch (Exception e) {
            log.error("Error scanning Redis for live locations: {}", e.getMessage());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public PageResponse<LocationHistoryResponse> getHistory(
            Long vehicleId, LocalDateTime start, LocalDateTime end, Pageable pageable) {

        vehicleService.getVehicle(vehicleId);
        Page<LocationHistory> page = locationHistoryRepository
                .findByVehicleIdAndRecordedAtBetweenOrderByRecordedAtDesc(vehicleId, start, end, pageable);

        return PageResponse.<LocationHistoryResponse>builder()
                .content(page.getContent().stream().map(locationHistoryMapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LocationHistoryResponse> getRouteForReplay(Long vehicleId, LocalDateTime start, LocalDateTime end) {
        vehicleService.getVehicle(vehicleId);
        return locationHistoryRepository
                .findByVehicleIdAndRecordedAtBetweenOrderByRecordedAtAsc(vehicleId, start, end)
                .stream()
                .map(locationHistoryMapper::toResponse)
                .toList();
    }

    // --- helpers ---

    private LocationHistory persistHistory(Vehicle vehicle, LocationRequest req) {
        LocationHistory history = LocationHistory.builder()
                .vehicle(vehicle)
                .latitude(BigDecimal.valueOf(req.getLatitude()))
                .longitude(BigDecimal.valueOf(req.getLongitude()))
                .speed(req.getSpeed() != null ? BigDecimal.valueOf(req.getSpeed()) : null)
                .heading(req.getHeading() != null ? BigDecimal.valueOf(req.getHeading()) : null)
                .recordedAt(LocalDateTime.now())
                .build();
        return locationHistoryRepository.save(history);
    }

    private void cacheLocation(Long vehicleId, LiveVehicleLocation location) {
        redisTemplate.opsForValue().set(
                RedisKeyConstants.vehicleLocation(vehicleId),
                location,
                Duration.ofHours(24));
    }

    private void updateLastSeen(Long vehicleId) {
        redisTemplate.opsForValue().set(
                RedisKeyConstants.vehicleLastSeen(vehicleId),
                LocalDateTime.now().toString(),
                Duration.ofHours(24));
    }

    private void checkGeofences(Vehicle vehicle, double lat, double lon) {
        List<Geofence> activeGeofences = geofenceService.findAllActive();
        for (Geofence fence : activeGeofences) {
            double distance = haversineMeters(
                    lat, lon,
                    fence.getCenterLatitude().doubleValue(),
                    fence.getCenterLongitude().doubleValue());

            boolean inside = distance <= fence.getRadiusMeters();
            String stateKey = "geofence:" + fence.getId() + ":vehicle:" + vehicle.getId();

            Object rawState = redisTemplate.opsForValue().get(stateKey);
            Boolean wasInside = rawState != null ? Boolean.parseBoolean(rawState.toString()) : null;

            if (inside && (wasInside == null || !wasInside)) {
                Alert alert = alertService.createAlert(vehicle, AlertType.GEOFENCE_ENTRY,
                        String.format("Vehicle %s entered geofence '%s'",
                                vehicle.getVehicleNumber(), fence.getName()), fence);
                redisPublisher.publish(RedisKeyConstants.ALERT_CHANNEL, alertMapper.toResponse(alert));
                redisTemplate.opsForValue().set(stateKey, "true", Duration.ofHours(24));

            } else if (!inside && Boolean.TRUE.equals(wasInside)) {
                Alert alert = alertService.createAlert(vehicle, AlertType.GEOFENCE_EXIT,
                        String.format("Vehicle %s exited geofence '%s'",
                                vehicle.getVehicleNumber(), fence.getName()), fence);
                redisPublisher.publish(RedisKeyConstants.ALERT_CHANNEL, alertMapper.toResponse(alert));
                redisTemplate.opsForValue().set(stateKey, "false", Duration.ofHours(24));
            }
        }
    }

    public static double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6_371_000.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private LiveVehicleLocation buildLiveLocation(Vehicle vehicle, LocationRequest req) {
        return LiveVehicleLocation.builder()
                .vehicleId(vehicle.getId())
                .vehicleNumber(vehicle.getVehicleNumber())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .speed(req.getSpeed())
                .heading(req.getHeading())
                .status(VehicleStatus.ACTIVE)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public LiveLocationResponse toLiveResponse(LiveVehicleLocation loc) {
        return LiveLocationResponse.builder()
                .vehicleId(loc.getVehicleId())
                .vehicleNumber(loc.getVehicleNumber())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .speed(loc.getSpeed())
                .heading(loc.getHeading())
                .status(loc.getStatus())
                .timestamp(loc.getTimestamp())
                .build();
    }
}
