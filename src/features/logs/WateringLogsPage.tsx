import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Droplets, Loader2, AlertCircle, ChevronLeft, ChevronRight, Download, BarChart3 } from 'lucide-react'
import api from '@/api/axios'

// ── Types ─────────────────────────────────────────────────────────────────────
interface WateringLogDTO {
  id: string
  deviceId: string
  triggeredBy: string
  triggerType: string
  startedAt: string
  endedAt: string | null
  waterAmountMl: number | null
}

interface WateringLogPageDTO {
  deviceId: string
  page: number
  size: number
  totalElements: number
  totalPages: number
  logs: WateringLogDTO[]
}

interface WateringLogStatsDTO {
  date: string
  totalWaterAmountMl: number
  wateringCount: number
}

// ── API ───────────────────────────────────────────────────────────────────────
const wateringApi = {
  getLogs: (deviceId: string, page: number, size = 20) =>
    api.get<{ data: WateringLogPageDTO }>(`/api/v1/my/devices/${deviceId}/water/logs`, {
      params: { page, size },
    }),
  getStats: (deviceId: string) =>
    api.get<{ data: WateringLogStatsDTO[] }>(`/api/v1/my/devices/${deviceId}/water/logs/stats`),
  exportCsv: (deviceId: string) =>
    api.get(`/api/v1/my/devices/${deviceId}/water/logs/export`, { responseType: 'blob' }),
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN')
}

function fmtDuration(start: string, end: string | null) {
  if (!end) return 'Đang tưới...'
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  return `${Math.floor(diff / 60)}m ${diff % 60}s`
}

function triggerBadge(type: string) {
  const map: Record<string, string> = {
    MANUAL: 'bg-blue-50 text-blue-600',
    AUTO: 'bg-green-50 text-green-600',
    SCHEDULE: 'bg-purple-50 text-purple-600',
  }
  return map[type] ?? 'bg-gray-100 text-gray-500'
}

// ── Stats Bar Chart ───────────────────────────────────────────────────────────
function StatsChart({ stats }: { stats: WateringLogStatsDTO[] }) {
  const max = Math.max(...stats.map((s) => s.totalWaterAmountMl ?? 0), 1)
  return (
    <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-5">
        <BarChart3 className="w-4 h-4 text-[#639922]" />
        Thống kê 7 ngày gần nhất
      </div>
      <div className="flex items-end gap-2 h-28">
        {stats.slice(-7).map((s) => (
          <div key={s.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400">{s.totalWaterAmountMl?.toFixed(0)}ml</span>
            <div
              className="w-full rounded-t-md bg-[#639922]/80 transition-all"
              style={{ height: `${((s.totalWaterAmountMl ?? 0) / max) * 80}px`, minHeight: 4 }}
            />
            <span className="text-[10px] text-gray-400">
              {new Date(s.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WateringLogsPage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const [page, setPage] = useState(0)
  const [downloading, setDownloading] = useState(false)

  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ['watering-logs', deviceId, page],
    queryFn: () => wateringApi.getLogs(deviceId!, page).then((r) => r.data.data),
    enabled: !!deviceId,
  })

  const { data: stats } = useQuery({
    queryKey: ['watering-stats', deviceId],
    queryFn: () => wateringApi.getStats(deviceId!).then((r) => r.data.data),
    enabled: !!deviceId,
  })

  const handleExport = async () => {
    setDownloading(true)
    try {
      const res = await wateringApi.exportCsv(deviceId!)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `watering-logs-${deviceId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ } finally {
      setDownloading(false)
    }
  }

  const logs = logsData?.logs ?? []
  const totalPages = logsData?.totalPages ?? 1
  const totalElements = logsData?.totalElements ?? 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-[#639922]" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Nhật ký tưới</h1>
            {totalElements > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">{totalElements} lần tưới</p>
            )}
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={downloading}
          className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-[8px] transition-colors text-gray-700 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Xuất CSV
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-5 overflow-auto">

        {/* Stats chart */}
        {stats && stats.length > 0 && <StatsChart stats={stats} />}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> Không thể tải nhật ký
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        )}

        {/* Table */}
        {!isLoading && logs.length > 0 && (
          <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">Bắt đầu</th>
                  <th className="text-left px-5 py-3.5">Kết thúc</th>
                  <th className="text-left px-5 py-3.5">Thời gian</th>
                  <th className="text-left px-5 py-3.5">Lượng nước</th>
                  <th className="text-left px-5 py-3.5">Loại</th>
                  <th className="text-left px-5 py-3.5">Kích hoạt bởi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{fmtDateTime(log.startedAt)}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{fmtDateTime(log.endedAt)}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{fmtDuration(log.startedAt, log.endedAt)}</td>
                    <td className="px-5 py-3.5">
                      {log.waterAmountMl != null ? (
                        <span className="text-[#639922] font-semibold text-sm">{log.waterAmountMl} ml</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${triggerBadge(log.triggerType)}`}>
                        {log.triggerType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{log.triggeredBy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>Trang {page + 1} / {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && logs.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Droplets className="w-6 h-6 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600 text-sm">Chưa có nhật ký</p>
            <p className="text-xs text-gray-400 mt-1">Bật bơm để bắt đầu ghi lại lịch sử tưới</p>
          </div>
        )}
      </div>
    </div>
  )
}