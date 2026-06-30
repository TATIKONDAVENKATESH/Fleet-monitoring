package com.example.backend.controller;

import com.example.backend.dto.response.AlertResponse;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "Alert retrieval and acknowledgement")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "List alerts (optionally filter unacknowledged)")
    public ResponseEntity<ApiResponse<PageResponse<AlertResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean acknowledged) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<AlertResponse> result = (acknowledged != null && !acknowledged)
                ? alertService.findUnacknowledged(pageable)
                : alertService.findAll(pageable);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "List alerts for a specific vehicle")
    public ResponseEntity<ApiResponse<PageResponse<AlertResponse>>> getByVehicle(
            @PathVariable Long vehicleId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(alertService.findByVehicle(vehicleId, pageable)));
    }

    @PatchMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge a single alert")
    public ResponseEntity<ApiResponse<AlertResponse>> acknowledge(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Alert acknowledged", alertService.acknowledge(id)));
    }

    @PatchMapping("/acknowledge-all")
    @Operation(summary = "Acknowledge all unacknowledged alerts")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> acknowledgeAll() {
        alertService.acknowledgeAll();
        return ResponseEntity.ok(ApiResponse.success("All alerts acknowledged", null));
    }
}