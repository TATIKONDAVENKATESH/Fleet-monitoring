-- V1__initial_schema.sql
-- Fleet Monitoring Platform - Initial Database Schema

-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255)        NOT NULL,
    email       VARCHAR(255)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(20)         NOT NULL CHECK (role IN ('ADMIN','MANAGER','DRIVER')),
    status      VARCHAR(20)         NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(255),
    updated_by  VARCHAR(255)
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_status  ON users(status);

-- =============================================
-- DRIVERS
-- =============================================
CREATE TABLE drivers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    phone_number    VARCHAR(20)     NOT NULL,
    license_number  VARCHAR(100)    NOT NULL UNIQUE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'AVAILABLE'
                        CHECK (status IN ('AVAILABLE','ON_TRIP','OFF_DUTY','SUSPENDED')),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    created_by      VARCHAR(255),
    updated_by      VARCHAR(255)
);

CREATE INDEX idx_drivers_license  ON drivers(license_number);
CREATE INDEX idx_drivers_status   ON drivers(status);

-- =============================================
-- VEHICLES
-- =============================================
CREATE TABLE vehicles (
    id                  BIGSERIAL PRIMARY KEY,
    vehicle_number      VARCHAR(50)     NOT NULL UNIQUE,
    vehicle_type        VARCHAR(20)     NOT NULL CHECK (vehicle_type IN ('CAR','TRUCK','VAN','MOTORCYCLE','BUS','OTHER')),
    registration_number VARCHAR(100)    NOT NULL UNIQUE,
    driver_id           BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE','INACTIVE','OFFLINE')),
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP,
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255)
);

CREATE INDEX idx_vehicles_number      ON vehicles(vehicle_number);
CREATE INDEX idx_vehicles_driver      ON vehicles(driver_id);
CREATE INDEX idx_vehicles_status      ON vehicles(status);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);

-- =============================================
-- LOCATION HISTORY
-- =============================================
CREATE TABLE location_history (
    id          BIGSERIAL PRIMARY KEY,
    vehicle_id  BIGINT          NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude    NUMERIC(10,7)   NOT NULL,
    longitude   NUMERIC(10,7)   NOT NULL,
    speed       NUMERIC(6,2),
    heading     NUMERIC(5,2),
    recorded_at TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_location_vehicle_time ON location_history(vehicle_id, recorded_at DESC);
CREATE INDEX idx_location_recorded_at  ON location_history(recorded_at DESC);

-- =============================================
-- GEOFENCES
-- =============================================
CREATE TABLE geofences (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    center_latitude     NUMERIC(10,7)   NOT NULL,
    center_longitude    NUMERIC(10,7)   NOT NULL,
    radius_meters       DOUBLE PRECISION NOT NULL,
    active              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP,
    created_by          VARCHAR(255),
    updated_by          VARCHAR(255)
);

CREATE INDEX idx_geofences_name   ON geofences(name);
CREATE INDEX idx_geofences_active ON geofences(active);

-- =============================================
-- ALERTS
-- =============================================
CREATE TABLE alerts (
    id              BIGSERIAL PRIMARY KEY,
    vehicle_id      BIGINT      NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    alert_type      VARCHAR(30) NOT NULL CHECK (alert_type IN ('OVERSPEED','OFFLINE','GEOFENCE_ENTRY','GEOFENCE_EXIT')),
    message         TEXT        NOT NULL,
    acknowledged    BOOLEAN     NOT NULL DEFAULT FALSE,
    geofence_id     BIGINT      REFERENCES geofences(id) ON DELETE SET NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMP
);

CREATE INDEX idx_alerts_vehicle      ON alerts(vehicle_id);
CREATE INDEX idx_alerts_type         ON alerts(alert_type);
CREATE INDEX idx_alerts_created      ON alerts(created_at DESC);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);

-- =============================================
-- REFRESH TOKENS
-- =============================================
CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512)    NOT NULL UNIQUE,
    expires_at  TIMESTAMP       NOT NULL
);

CREATE INDEX idx_refresh_token_value ON refresh_tokens(token);
CREATE INDEX idx_refresh_token_user  ON refresh_tokens(user_id);

-- =============================================
-- DEFAULT ADMIN USER
-- (password = Admin@123 BCrypt encoded)
-- =============================================
INSERT INTO users (name, email, password, role, status, created_at)
VALUES (
    'System Admin',
    'admin@fleet.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    'ACTIVE',
    NOW()
);