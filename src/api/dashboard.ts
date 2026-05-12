import axios from 'axios'
import type { ApiResponse, SoilSensorReadingDTO, AirSensorReadingDTO, SoilSensorHistoryDTO, AirSensorHistoryDTO, SoilSensorStatsDTO } from '@/types'

const REMOTE = 'https://api.irrigation.studio'

function headers() {
  const token = localStorage.getItem('accessToken')
  return { Authorization: `Bearer ${token}` }
}

export const dashboardApi = {
  // Soil
  getLatestSoil: (deviceId: string) =>
    axios.get<ApiResponse<SoilSensorReadingDTO>>(`${REMOTE}/api/v1/devices/${deviceId}/soil/latest`, { headers: headers() }),

  getSoilHistory: (deviceId: string, startDate: string, endDate: string, interval = 'RAW') =>
    axios.get<ApiResponse<SoilSensorHistoryDTO[]>>(`${REMOTE}/api/v1/devices/${deviceId}/soil/history`, {
      headers: headers(),
      params: { startDate, endDate, interval },
    }),

  getSoilStats: (deviceId: string) =>
    axios.get<ApiResponse<SoilSensorStatsDTO>>(`${REMOTE}/api/v1/devices/${deviceId}/soil/stats`, { headers: headers() }),

  // Air
  getLatestAir: (deviceId: string) =>
    axios.get<ApiResponse<AirSensorReadingDTO>>(`${REMOTE}/api/v1/devices/${deviceId}/air/latest`, { headers: headers() }),

  getAirHistory: (deviceId: string, startDate: string, endDate: string, interval = 'RAW') =>
    axios.get<ApiResponse<AirSensorHistoryDTO[]>>(`${REMOTE}/api/v1/devices/${deviceId}/air/history`, {
      headers: headers(),
      params: { startDate, endDate, interval },
    }),
}