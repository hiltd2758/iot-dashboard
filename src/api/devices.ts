import api from "./axios";
import type {
  ApiResponse,
  DeviceDTO,
  DeviceConfigDTO,
  PageResponse,
} from "@/types";

export const myDeviceApi = {
  getMyDevices: () =>
    api.get<ApiResponse<DeviceDTO[]>>(`/api/v1/my/devices`),

  getDetail: (deviceId: string) =>
    api.get<ApiResponse<DeviceDTO>>(`/api/v1/my/devices/${deviceId}`),

  claimDevice: (chipId: string) =>
    api.post<ApiResponse<DeviceDTO>>(`/api/v1/my/devices/claim`, { chipId }),

  unclaimDevice: (deviceId: string) =>
    api.delete<ApiResponse<void>>(`/api/v1/my/devices/${deviceId}/unclaim`),

  updateName: (deviceId: string, name: string) =>
    api.patch<ApiResponse<DeviceDTO>>(`/api/v1/my/devices/${deviceId}/name`, { name }),
};

export const deviceConfigApi = {
  getConfig: (deviceId: string) =>
    api.get<ApiResponse<DeviceConfigDTO>>(`/api/v1/my/devices/${deviceId}/config`),

  updateConfig: (deviceId: string, body: Partial<DeviceConfigDTO>) =>
    api.put<ApiResponse<DeviceConfigDTO>>(`/api/v1/my/devices/${deviceId}/config`, body),
};

export const adminDeviceApi = {
  getAll: (page = 0, size = 10) =>
    api.get<ApiResponse<PageResponse<DeviceDTO>>>("/api/v1/admin/devices", {
      params: { page, size },
    }),

  getById: (id: string) =>
    api.get<ApiResponse<DeviceDTO>>(`/api/v1/admin/devices/${id}`),

  create: (body: { userId: string; name: string }) =>
    api.post<ApiResponse<DeviceDTO>>("/api/v1/admin/devices", body),

  delete: (id: string) =>
    api.delete<void>(`/api/v1/admin/devices/${id}`),

  calibrate: (id: string, body: object) =>
    api.put<ApiResponse<DeviceDTO>>(`/api/v1/admin/devices/${id}/calibrate`, body),
};