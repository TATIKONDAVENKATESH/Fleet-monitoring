// ─── Auth ─────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export type Role = 'ADMIN' | 'MANAGER' | 'DRIVER';

// ─── User ──────────────────────────────────────────────────────────────────
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Driver ────────────────────────────────────────────────────────────────
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';

export interface Driver {
  id: number;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRequest {
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  status?: DriverStatus;
}

// ─── Vehicle ───────────────────────────────────────────────────────────────
export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'OFFLINE';
export type VehicleType = 'CAR' | 'TRUCK' | 'VAN' | 'MOTORCYCLE' | 'BUS' | 'OTHER';

export interface Vehicle {
  id: number;
  vehicleNumber: string;
  vehicleType: VehicleType;
  registrationNumber: string;
  driverId?: number;
  driverName?: string;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleRequest {
  vehicleNumber: string;
  vehicleType: VehicleType;
  registrationNumber: string;
  driverId?: number;
  status?: VehicleStatus;
}

// ─── Tracking ──────────────────────────────────────────────────────────────
export interface LocationRequest {
  vehicleId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
}

export interface LiveLocation {
  vehicleId: number;
  vehicleNumber: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  status: VehicleStatus;
  timestamp: string;
}

export interface LocationHistory {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  recordedAt: string;
}

// ─── Geofence ──────────────────────────────────────────────────────────────
export interface Geofence {
  id: number;
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  active: boolean;
  createdAt: string;
}

export interface GeofenceRequest {
  name: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  active?: boolean;
}

// ─── Alert ─────────────────────────────────────────────────────────────────
export type AlertType = 'OVERSPEED' | 'OFFLINE' | 'GEOFENCE_ENTRY' | 'GEOFENCE_EXIT';

export interface Alert {
  id: number;
  vehicleId: number;
  vehicleNumber: string;
  alertType: AlertType;
  message: string;
  acknowledged: boolean;
  geofenceId?: number;
  geofenceName?: string;
  createdAt: string;
  acknowledgedAt?: string;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  offlineVehicles: number;
  inactiveVehicles: number;
  totalAlerts: number;
  unacknowledgedAlerts: number;
  totalDrivers: number;
  availableDrivers: number;
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
