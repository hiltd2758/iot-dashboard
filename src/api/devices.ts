import axios from "axios";
import api from "./axios";
import type {
  ApiResponse,
  DeviceDTO,
  DeviceConfigDTO,
  PageResponse,
} from "@/types";

const REMOTE = "https://api.irrigation.studio";

function remoteHeaders() {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
}

// ── User - My Devices (remote) ────────────────────────────────────────────────
export const myDeviceApi = {
  getMyDevices: () =>
    axios.get<ApiResponse<DeviceDTO[]>>(`${REMOTE}/api/v1/my/devices`, {
      headers: remoteHeaders(),
    }),

  getDetail: (deviceId: string) =>
    axios.get<ApiResponse<DeviceDTO>>(
      `${REMOTE}/api/v1/my/devices/${deviceId}`,
      {
        headers: remoteHeaders(),
      },
    ),

  claimDevice: (chipId: string) =>
    axios.post<ApiResponse<DeviceDTO>>(
      `${REMOTE}/api/v1/my/devices/claim`,
      { chipId },
      {
        headers: remoteHeaders(),
      },
    ),

  unclaimDevice: (deviceId: string) =>
    axios.delete<ApiResponse<void>>(
      `${REMOTE}/api/v1/my/devices/${deviceId}/unclaim`,
      {
        headers: remoteHeaders(),
      },
    ),

  updateName: (deviceId: string, name: string) =>
    axios.patch<ApiResponse<DeviceDTO>>(
      `${REMOTE}/api/v1/my/devices/${deviceId}/name`,
      { name },
      {
        headers: remoteHeaders(),
      },
    ),
};

// ── User - Device Config (remote) ─────────────────────────────────────────────
export const deviceConfigApi = {
  getConfig: (deviceId: string) =>
    axios.get<ApiResponse<DeviceConfigDTO>>(
      `${REMOTE}/api/v1/my/devices/${deviceId}/config`,
      {
        headers: remoteHeaders(),
      },
    ),

  updateConfig: (deviceId: string, body: Partial<DeviceConfigDTO>) =>
    axios.put<ApiResponse<DeviceConfigDTO>>(
      `${REMOTE}/api/v1/my/devices/${deviceId}/config`,
      body,
      {
        headers: remoteHeaders(),
      },
    ),
};

// ── Admin - Devices (local) ───────────────────────────────────────────────────
export const adminDeviceApi = {
  getAll: (page = 0, size = 10) =>
    api.get<ApiResponse<PageResponse<DeviceDTO>>>("/api/v1/admin/devices", {
      params: { page, size },
    }),

  getById: (id: string) =>
    api.get<ApiResponse<DeviceDTO>>(`/api/v1/admin/devices/${id}`),

  create: (body: { userId: string; name: string }) =>
    api.post<ApiResponse<DeviceDTO>>("/api/v1/admin/devices", body),

  delete: (id: string) => api.delete<void>(`/api/v1/admin/devices/${id}`),

  calibrate: (id: string, body: object) =>
    api.put<ApiResponse<DeviceDTO>>(
      `/api/v1/admin/devices/${id}/calibrate`,
      body,
    ),
};
