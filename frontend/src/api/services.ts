import apiClient from './client';
import type {
  AuthResponse, LoginRequest, User, Driver, DriverRequest,
  Vehicle, VehicleRequest, Geofence, GeofenceRequest,
  Alert, DashboardStats, LiveLocation, LocationHistory,
  PageResponse, ApiResponse, LocationRequest,
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/login', data),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/register', data),
  logout: (refreshToken: string) =>
    apiClient.post('/v1/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/v1/auth/refresh', { refreshToken }),
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiClient.get<ApiResponse<DashboardStats & { liveLocations: LiveLocation[] }>>('/v1/dashboard'),
};

// ─── Profile (self-service) ─────────────────────────────────────────────────
export const profileApi = {
  getMe: () => apiClient.get<ApiResponse<User>>('/v1/profile'),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch<ApiResponse<void>>('/v1/profile/password', { currentPassword, newPassword }),
};

// ─── Users ─────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<User>>>(`/v1/users?page=${page}&size=${size}`),
  getById: (id: number) => apiClient.get<ApiResponse<User>>(`/v1/users/${id}`),
  updateStatus: (id: number, status: string) =>
    apiClient.patch<ApiResponse<User>>(`/v1/users/${id}/status`, null, { params: { status } }),
  delete: (id: number) => apiClient.delete(`/v1/users/${id}`),
};

// ─── Drivers ───────────────────────────────────────────────────────────────
export const driverApi = {
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Driver>>>(`/v1/drivers?page=${page}&size=${size}`),
  getById: (id: number) => apiClient.get<ApiResponse<Driver>>(`/v1/drivers/${id}`),
  create: (data: DriverRequest) =>
    apiClient.post<ApiResponse<Driver>>('/v1/drivers', data),
  update: (id: number, data: Partial<DriverRequest>) =>
    apiClient.put<ApiResponse<Driver>>(`/v1/drivers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/v1/drivers/${id}`),
};

// ─── Vehicles ──────────────────────────────────────────────────────────────
export const vehicleApi = {
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Vehicle>>>(`/v1/vehicles?page=${page}&size=${size}`),
  getById: (id: number) => apiClient.get<ApiResponse<Vehicle>>(`/v1/vehicles/${id}`),
  create: (data: VehicleRequest) =>
    apiClient.post<ApiResponse<Vehicle>>('/v1/vehicles', data),
  update: (id: number, data: Partial<VehicleRequest>) =>
    apiClient.put<ApiResponse<Vehicle>>(`/v1/vehicles/${id}`, data),
  delete: (id: number) => apiClient.delete(`/v1/vehicles/${id}`),
};

// ─── Tracking ──────────────────────────────────────────────────────────────
export const trackingApi = {
  postLocation: (data: LocationRequest) =>
    apiClient.post<ApiResponse<LiveLocation>>('/v1/tracking/location', data),
  getLiveLocation: (vehicleId: number) =>
    apiClient.get<ApiResponse<LiveLocation>>(`/v1/tracking/live/${vehicleId}`),
  getAllLiveLocations: () =>
    apiClient.get<ApiResponse<LiveLocation[]>>('/v1/tracking/live'),
  getHistory: (vehicleId: number, params: {
    startDate: string; endDate: string; page?: number; size?: number;
  }) =>
    apiClient.get<ApiResponse<PageResponse<LocationHistory>>>(
      `/v1/tracking/history/${vehicleId}`, { params }),
  getRouteReplay: (vehicleId: number, startDate: string, endDate: string) =>
    apiClient.get<ApiResponse<LocationHistory[]>>(
      `/v1/tracking/replay/${vehicleId}`, { params: { startDate, endDate } }),
};

// ─── Geofences ─────────────────────────────────────────────────────────────
export const geofenceApi = {
  getAll: () => apiClient.get<ApiResponse<Geofence[]>>('/v1/geofences'),
  getById: (id: number) => apiClient.get<ApiResponse<Geofence>>(`/v1/geofences/${id}`),
  create: (data: GeofenceRequest) =>
    apiClient.post<ApiResponse<Geofence>>('/v1/geofences', data),
  update: (id: number, data: Partial<GeofenceRequest>) =>
    apiClient.put<ApiResponse<Geofence>>(`/v1/geofences/${id}`, data),
  delete: (id: number) => apiClient.delete(`/v1/geofences/${id}`),
};

// ─── Alerts ────────────────────────────────────────────────────────────────
export const alertApi = {
  getAll: (page = 0, size = 20, acknowledged?: boolean) =>
    apiClient.get<ApiResponse<PageResponse<Alert>>>('/v1/alerts', {
      params: { page, size, ...(acknowledged !== undefined && { acknowledged }) },
    }),
  getByVehicle: (vehicleId: number, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Alert>>>(`/v1/alerts/vehicle/${vehicleId}`, {
      params: { page, size },
    }),
  acknowledge: (id: number) =>
    apiClient.patch<ApiResponse<Alert>>(`/v1/alerts/${id}/acknowledge`),
  acknowledgeAll: () => apiClient.patch('/v1/alerts/acknowledge-all'),
};