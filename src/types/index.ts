// ===== API Response Wrapper =====
export interface ApiResponse<T> {
  status: number
  message: string
  path?: string
  timestamp: string
  data: T
}

// ===== Auth =====
export interface LoginRequestDTO {
  username: string
  password: string
}

export interface RegistrationDTO {
  username: string
  email: string
  password: string
  name: string
}

export interface LoginResponseDTO {
  id: string
  username: string
  email: string
  name: string
  oauthId?: string
  roles: string[]
  token: string           // access token
  refreshToken: string
}

export interface TokenResponseDTO {
  accessToken: string     // refresh endpoint trả accessToken
  refreshToken: string
}

export interface RefreshTokenDTO {
  refreshToken: string
}

// ===== User =====
export interface UserProfileDTO {
  id: string
  username: string
  email: string
  name: string
  roles: string[]
  createdAt: string
}

// ===== Device =====
export interface DeviceDTO {
  id: string
  name: string
  userId: string
  username: string
  status: string
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

export interface CalibrateDeviceDTO {
  soilMoistureOffset?: number
  airTemperatureOffset?: number
  airHumidityOffset?: number
}

export interface DeviceConfigDTO {
  id?: string
  deviceId?: string
  autoWaterEnabled?: boolean
  moistureThresholdLow?: number
  moistureThresholdHigh?: number
  [key: string]: unknown
}

export interface UpdateDeviceConfigDTO {
  autoWaterEnabled?: boolean
  moistureThresholdLow?: number
  moistureThresholdHigh?: number
  [key: string]: unknown
}

// ===== Notification =====
export interface NotificationDTO {
  id: string
  userId: string
  deviceId: string
  title: string
  message: string
  type: string
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface UnreadCountDTO {
  unreadCount: number
}

// ===== Role & Permission =====
export interface RoleDTO {
  id: string
  name: string
  description?: string
  permissions?: PermissionDTO[]
}

export interface PermissionDTO {
  id: string
  name: string
  description?: string
}

export interface CreateRoleDTO {
  name: string
  description?: string
}

export interface CreatePermissionDTO {
  name: string
  description?: string
}

export interface UpdateUserRolesDTO {
  roles: string[]
}

export interface UpdateRolePermissionsDTO {
  permissions: string[]
}

// ===== Pagination =====
export interface Pageable {
  page: number
  size: number
  sort?: string[]
}

export interface PageResponse<T> {
  totalPages: number
  totalElements: number
  size: number
  content: T[]
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// ===== Audit Log =====
export interface AuditLogDto {
  id: string
  userId: string
  username: string
  action: string
  targetId: string
  payload: string
  createdAt: string
}

// ===== System Config =====
export interface SystemConfigDto {
  [key: string]: unknown
}

export interface ResetPasswordRequest {
  newPassword: string
}