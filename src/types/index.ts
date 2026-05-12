// ===== API Response =====
export interface ApiResponse<T> {
  status: number
  message: string
  path?: string
  timestamp: string
  data: T
}

// ===== Auth =====
export interface LoginRequestDTO { username: string; password: string }
export interface RegistrationDTO { username: string; email: string; password: string; name: string }
export interface LoginResponseDTO {
  id: string; username: string; email: string; name: string
  oauthId?: string; roles: string[]; token: string; refreshToken: string
}
export interface TokenResponseDTO { accessToken: string; refreshToken: string }
export interface RefreshTokenDTO { refreshToken: string }

// ===== User =====
export interface UserProfileDTO {
  id: string; username: string; email: string; name: string
  roles: string[]; createdAt: string
}

// ===== Device =====
export interface DeviceDTO {
  id: string
  name: string
  userId: string
  username: string
  status: string
  chipId: string          // ← thêm
  claimedAt: string | null   // ← thêm
  lastSeenAt: string | null  // ← thêm
  statusDelay: boolean       // ← thêm
  autoWaterEnabled: boolean
  moistureThresholdLow: number
  moistureThresholdHigh: number
  soilMoistureOffset: number
  airTemperatureOffset: number
  airHumidityOffset: number
}

export interface CreateDeviceDTO {
  userId: string
  name: string
}

export interface DeviceControlDTO {
  command: 'ON' | 'OFF'
}

export interface CalibrateDeviceDTO {
  soilMoistureOffset?: number
  airTemperatureOffset?: number
  airHumidityOffset?: number
}

export interface DeviceConfigDTO {
  autoWaterEnabled?: boolean
  moistureThresholdLow?: number
  moistureThresholdHigh?: number
  [key: string]: unknown
}

// ===== Sensor =====
export interface SoilSensorReadingDTO {
  deviceId: string
  moisturePercent: number
  recordedAt: string
}

export interface AirSensorReadingDTO {
  deviceId: string
  temperatureCelsius: number
  humidityPercent: number
  recordedAt: string
}

export interface SoilSensorHistoryDTO {
  timestamp: string
  avgMoisturePercent: number
}

export interface AirSensorHistoryDTO {
  timestamp: string
  avgTemperatureCelsius: number
  avgHumidityPercent: number
}

export interface PeriodStats {
  minMoisturePercent: number
  maxMoisturePercent: number
  avgMoisturePercent: number
}

export interface SoilSensorStatsDTO {
  last24Hours: PeriodStats
  last7Days: PeriodStats
  last30Days: PeriodStats
}

// ===== Notification =====
export interface NotificationDTO {
  id: string; userId: string; deviceId: string
  title: string; message: string; type: string
  isRead: boolean; readAt: string | null; createdAt: string
}
export interface UnreadCountDTO { unreadCount: number }

// ===== Role & Permission =====
export interface RoleDTO { id: string; name: string; description?: string; permissions?: PermissionDTO[] }
export interface PermissionDTO { id: string; name: string; description?: string }
export interface CreateRoleDTO { name: string; description?: string }
export interface UpdateUserRolesDTO { roles: string[] }
export interface UpdateRolePermissionsDTO { permissions: string[] }

// ===== Pagination =====
export interface PageResponse<T> {
  totalPages: number; totalElements: number; size: number
  content: T[]; number: number; numberOfElements: number
  first: boolean; last: boolean; empty: boolean
}

// ===== Audit =====
export interface AuditLogDto {
  id: string; userId: string; username: string
  action: string; targetId: string; payload: string; createdAt: string
}

// ===== MQTT =====
export interface MqttSensorPayload {
  soil_moisture: number
  temperature: number
  humidity: number
}
export interface MqttStatusPayload {
  status: 'online' | 'offline'
  rssi: number
}