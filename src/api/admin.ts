import api from "./axios";
import type { ApiResponse, DeviceDTO, PageResponse } from "@/types";

export const adminApi = {
  getAllDevices: (page = 0, size = 10) =>
    api.get<ApiResponse<PageResponse<DeviceDTO>>>(`/api/v1/admin/devices`, {
      params: { page, size },
    }),

  getDeviceDetail: (id: string) =>
    api.get<ApiResponse<DeviceDTO>>(`/api/v1/admin/devices/${id}`),

  deleteDevice: (id: string) =>
    api.delete<void>(`/api/v1/admin/devices/${id}`),

  calibrateDevice: (id: string, body: { soilMoistureOffset?: number; airTemperatureOffset?: number; airHumidityOffset?: number }) =>
    api.put<ApiResponse<DeviceDTO>>(`/api/v1/admin/devices/${id}/calibrate`, body),
};