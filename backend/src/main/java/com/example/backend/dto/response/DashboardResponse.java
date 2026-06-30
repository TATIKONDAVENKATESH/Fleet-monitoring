package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardResponse {

    private long totalVehicles;
    private long activeVehicles;
    private long offlineVehicles;
    private long inactiveVehicles;      // added
    private long totalAlerts;
    private long unacknowledgedAlerts;
    private long totalDrivers;
    private long availableDrivers;      // added
    private List<LiveLocationResponse> liveLocations;
}