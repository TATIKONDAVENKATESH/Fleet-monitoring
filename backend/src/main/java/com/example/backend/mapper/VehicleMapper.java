package com.example.backend.mapper;

import com.example.backend.dto.response.VehicleResponse;
import com.example.backend.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VehicleMapper {
    @Mapping(target = "driverId", source = "driver.id")
    @Mapping(target = "driverName", source = "driver.name")
    VehicleResponse toResponse(Vehicle vehicle);
}