package com.example.backend.redis;

public final class RedisKeyConstants {
    private RedisKeyConstants() {}

    public static final String VEHICLE_LOCATION_PREFIX = "vehicle:";
    public static final String VEHICLE_LAST_SEEN_PREFIX = "vehicle:last_seen:";
    public static final String LOCATION_CHANNEL = "vehicle-location-updates";
    public static final String ALERT_CHANNEL = "vehicle-alert-updates";

    public static String vehicleLocation(Long vehicleId) {
        return VEHICLE_LOCATION_PREFIX + vehicleId;
    }
    public static String vehicleLastSeen(Long vehicleId) {
        return VEHICLE_LAST_SEEN_PREFIX + vehicleId;
    }
}