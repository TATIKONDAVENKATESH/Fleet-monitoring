package com.example.backend.mapper;

import com.example.backend.dto.request.GeofenceRequest;
import com.example.backend.dto.response.GeofenceResponse;
import com.example.backend.entity.Geofence;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GeofenceMapper {

    @Mapping(target = "centerLatitude",
            expression = "java(geofence.getCenterLatitude().doubleValue())")
    @Mapping(target = "centerLongitude",
            expression = "java(geofence.getCenterLongitude().doubleValue())")
    GeofenceResponse toResponse(Geofence geofence);

    @Mapping(target = "id",         ignore = true)
    @Mapping(target = "centerLatitude",
            expression = "java(java.math.BigDecimal.valueOf(request.getCenterLatitude()))")
    @Mapping(target = "centerLongitude",
            expression = "java(java.math.BigDecimal.valueOf(request.getCenterLongitude()))")
    @Mapping(target = "active",
            expression = "java(request.getActive() != null ? request.getActive() : Boolean.TRUE)")
    Geofence toEntity(GeofenceRequest request);
}