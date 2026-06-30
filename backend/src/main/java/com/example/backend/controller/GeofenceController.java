package com.example.backend.controller;

import com.example.backend.dto.request.GeofenceRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.GeofenceResponse;
import com.example.backend.service.GeofenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/geofences")
@RequiredArgsConstructor
@Tag(name = "Geofences", description = "Circular geofence management")
public class GeofenceController {

    private final GeofenceService geofenceService;

    /**
     * BUG FIX B10: Original returned Page<GeofenceResponse> but the frontend
     * geofenceApi.getAll() expects a plain Geofence[] (array), not a paginated
     * wrapper. Now returns List which serialises to a JSON array.
     */
    @GetMapping
    @Operation(summary = "List all geofences")
    public ResponseEntity<ApiResponse<List<GeofenceResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(geofenceService.findAllAsList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a geofence by id")
    public ResponseEntity<ApiResponse<GeofenceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(geofenceService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new geofence")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<GeofenceResponse>> create(
            @Valid @RequestBody GeofenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Geofence created", geofenceService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing geofence")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<GeofenceResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody GeofenceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Geofence updated", geofenceService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a geofence")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        geofenceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Geofence deleted", null));
    }
}