package com.example.backend.controller;

import com.example.backend.constant.DriverStatus;
import com.example.backend.dto.request.DriverRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.DriverResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.service.DriverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Drivers", description = "Driver management")
public class DriverController {


    private final DriverService driverService;

    @GetMapping
    @Operation(summary = "List all drivers (paginated)")
    public ResponseEntity<ApiResponse<PageResponse<DriverResponse>>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DriverResponse> result = driverService.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get driver by ID")
    public ResponseEntity<ApiResponse<DriverResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(driverService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new driver")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<DriverResponse>> create(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver created", driverService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a driver")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<DriverResponse>> update(
            @PathVariable Long id, @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Driver updated", driverService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a driver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        driverService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Driver deleted", null));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update driver status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<DriverResponse>> updateStatus(
            @PathVariable Long id, @RequestParam DriverStatus status) {
        return ResponseEntity.ok(ApiResponse.success(driverService.updateStatus(id, status)));
    }
}