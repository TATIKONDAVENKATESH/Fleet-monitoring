package com.example.backend.controller;

import com.example.backend.dto.request.LocationRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.LiveLocationResponse;
import com.example.backend.dto.response.LocationHistoryResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.service.TrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking", description = "Live location ingestion and history")
public class TrackingController {

    private final TrackingService trackingService;

    @PostMapping("/location")
    @Operation(summary = "Ingest a GPS location update from a vehicle")
    public ResponseEntity<ApiResponse<LiveLocationResponse>> ingestLocation(
            @Valid @RequestBody LocationRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Location processed", trackingService.processLocation(request)));
    }

    @GetMapping("/live/{vehicleId}")
    @Operation(summary = "Get current live location for a vehicle")
    public ResponseEntity<ApiResponse<LiveLocationResponse>> getLive(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(ApiResponse.success(trackingService.getLiveLocation(vehicleId)));
    }

    @GetMapping("/live")
    @Operation(summary = "Get live locations for all vehicles (from Redis cache)")
    public ResponseEntity<ApiResponse<List<LiveLocationResponse>>> getAllLive() {
        List<LiveLocationResponse> locations = trackingService.getAllLiveLocations()
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
        return ResponseEntity.ok(ApiResponse.success(locations));
    }

    @GetMapping("/history/{vehicleId}")
    @Operation(summary = "Get paginated location history for a vehicle")
    public ResponseEntity<ApiResponse<PageResponse<LocationHistoryResponse>>> getHistory(
            @PathVariable Long vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "recordedAt"));
        return ResponseEntity.ok(ApiResponse.success(
                trackingService.getHistory(vehicleId, startDate, endDate, pageable)));
    }

    @GetMapping("/replay/{vehicleId}")
    @Operation(summary = "Get ordered route coordinates for front-end replay animation")
    public ResponseEntity<ApiResponse<List<LocationHistoryResponse>>> getRouteReplay(
            @PathVariable Long vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        return ResponseEntity.ok(ApiResponse.success(
                trackingService.getRouteForReplay(vehicleId, startDate, endDate)));
    }
}