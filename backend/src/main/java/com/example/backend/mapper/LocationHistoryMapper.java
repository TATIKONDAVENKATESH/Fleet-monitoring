package com.example.backend.mapper;

import com.example.backend.dto.response.LocationHistoryResponse;
import com.example.backend.entity.LocationHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LocationHistoryMapper {

    @Mapping(target = "vehicleId",  source = "vehicle.id")
    @Mapping(target = "vehicleNumber", source = "vehicle.vehicleNumber")
    @Mapping(target = "latitude",  expression = "java(locationHistory.getLatitude().doubleValue())")
    @Mapping(target = "longitude", expression = "java(locationHistory.getLongitude().doubleValue())")
    @Mapping(target = "speed",   expression = "java(locationHistory.getSpeed()   != null ? locationHistory.getSpeed().doubleValue()   : null)")
    @Mapping(target = "heading", expression = "java(locationHistory.getHeading() != null ? locationHistory.getHeading().doubleValue() : null)")
    LocationHistoryResponse toResponse(LocationHistory locationHistory);
}