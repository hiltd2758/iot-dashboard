import api from "@/api/axios";
import type {
  ApiResponse,
  SoilSensorReadingDTO,
  AirSensorReadingDTO,
  SoilSensorHistoryDTO,
  AirSensorHistoryDTO,
  SoilSensorStatsDTO,
  DashboardSummaryDTO,
} from "@/types";

export const dashboardApi = {
  getLatestSoil: (deviceId: string) =>
    api.get<ApiResponse<SoilSensorReadingDTO>>(
      `/api/v1/my/devices/${deviceId}/soil/latest`,
    ),

  getLatestAir: (deviceId: string) =>
    api.get<ApiResponse<AirSensorReadingDTO>>(
      `/api/v1/my/devices/${deviceId}/air/latest`,
    ),

  getDashboardSummary: (deviceId: string) =>
    api.get<ApiResponse<DashboardSummaryDTO>>(
      `/api/v1/my/devices/${deviceId}/summary`,
    ),

  getSoilHistory: (
    deviceId: string,
    startDate: string,
    endDate: string,
    interval: "RAW" | "HOURLY" | "DAILY" = "HOURLY",
  ) =>
    api.get<ApiResponse<SoilSensorHistoryDTO[]>>(
      `/api/v1/my/devices/${deviceId}/soil/history`,
      {
        params: { startDate, endDate, interval },
      },
    ),

  getAirHistory: (
    deviceId: string,
    startDate: string,
    endDate: string,
    interval: "RAW" | "HOURLY" | "DAILY" = "HOURLY",
  ) =>
    api.get<ApiResponse<AirSensorHistoryDTO[]>>(
      `/api/v1/my/devices/${deviceId}/air/history`,
      {
        params: { startDate, endDate, interval },
      },
    ),

  getSoilStats: (deviceId: string) =>
    api.get<ApiResponse<SoilSensorStatsDTO>>(
      `/api/v1/my/devices/${deviceId}/soil/stats`,
    ),

  startManualWatering: (deviceId: string) =>
    api.post(`/api/v1/my/devices/${deviceId}/water/start`, {}),

  controlDevice: (deviceId: string, command: "ON" | "OFF") =>
    api.post(`/api/v1/my/devices/${deviceId}/control`, { command }),
};
