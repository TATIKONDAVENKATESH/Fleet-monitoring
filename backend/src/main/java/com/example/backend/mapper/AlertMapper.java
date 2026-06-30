package com.example.backend.mapper;

import com.example.backend.dto.response.AlertResponse;
import com.example.backend.entity.Alert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlertMapper {
    @Mapping(target = "vehicleId", source = "vehicle.id")
    @Mapping(target = "vehicleNumber", source = "vehicle.vehicleNumber")
    @Mapping(target = "geofenceId", source = "geofence.id")
    @Mapping(target = "geofenceName", source = "geofence.name")
    AlertResponse toResponse(Alert alert);
}