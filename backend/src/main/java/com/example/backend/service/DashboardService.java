package com.example.backend.service;

import com.example.backend.constant.DriverStatus;
import com.example.backend.constant.VehicleStatus;
import com.example.backend.dto.response.DashboardResponse;
import com.example.backend.dto.response.LiveLocationResponse;
import com.example.backend.redis.LiveVehicleLocation;
import com.example.backend.repository.AlertRepository;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final AlertRepository alertRepository;
    private final TrackingService trackingService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalVehicles    = vehicleRepository.count();
        long activeVehicles   = vehicleRepository.countByStatus(VehicleStatus.ACTIVE);
        long offlineVehicles  = vehicleRepository.countByStatus(VehicleStatus.OFFLINE);
        // BUG FIX B8: populate inactiveVehicles
        long inactiveVehicles = vehicleRepository.countByStatus(VehicleStatus.INACTIVE);
        long totalAlerts      = alertRepository.countTotal();
        long unacknowledged   = alertRepository.countByAcknowledgedFalse();
        long totalDrivers     = driverRepository.count();
        // BUG FIX B8: populate availableDrivers
        long availableDrivers = driverRepository.countByStatus(DriverStatus.AVAILABLE);

        List<LiveLocationResponse> liveLocations = trackingService.getAllLiveLocations()
                .stream()
                .map(loc -> LiveLocationResponse.builder()
                        .vehicleId(loc.getVehicleId())
                        .vehicleNumber(loc.getVehicleNumber())
                        .latitude(loc.getLatitude())
                        .longitude(loc.getLongitude())
                        .speed(loc.getSpeed())
                        .heading(loc.getHeading())
                        .status(loc.getStatus())
                        .timestamp(loc.getTimestamp())
                        .build())
                .toList();

        return DashboardResponse.builder()
                .totalVehicles(totalVehicles)
                .activeVehicles(activeVehicles)
                .offlineVehicles(offlineVehicles)
                .inactiveVehicles(inactiveVehicles)
                .totalAlerts(totalAlerts)
                .unacknowledgedAlerts(unacknowledged)
                .totalDrivers(totalDrivers)
                .availableDrivers(availableDrivers)
                .liveLocations(liveLocations)
                .build();
    }
}