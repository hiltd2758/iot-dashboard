import { useEffect, useState } from 'react'
import { ScrollText, Loader2, AlertCircle, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import api from '@/api/axios'
import type { AuditLogDto } from '@/types'

const auditApi = {
  getLogs: (params: {
    userId?: string
    from?: string
    to?: string
    page?: number
    size?: number
  }) => api.get<{ content: AuditLogDto[]; totalPages: number; totalElements: number }>(
    '/api/admin/audit-log', { params: { size: 20, ...params } }
  ),
}

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    CLAIM_DEVICE: 'bg-green-50 text-green-600',
    UNCLAIM_DEVICE: 'bg-orange-50 text-orange-600',
    DELETE: 'bg-red-50 text-red-500',
    UPDATE: 'bg-blue-50 text-blue-500',
    LOGIN: 'bg-purple-50 text-purple-500',
    CREATE: 'bg-teal-50 text-teal-600',
  }
  const matched = Object.keys(colorMap).find((k) => action.includes(k))
  const cls = matched ? colorMap[matched] : 'bg-gray-100 text-gray-500'
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {action}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN')
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Filters
  const [userId, setUserId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  const fetchLogs = async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await auditApi.getLogs({
        page: p,
        ...(userId ? { userId } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      })
      setLogs(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    } catch {
      setError('Không thể tải audit log.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs(page) }, [page])

  const handleFilter = () => {
    setPage(0)
    fetchLogs(0)
    setShowFilter(false)
  }

  const clearFilters = () => {
    setUserId('')
    setFrom('')
    setTo('')
    setPage(0)
    fetchLogs(0)
  }

  const hasFilters = userId || from || to

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrollText className="w-5 h-5 text-[#639922]" />
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Audit Log</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {totalElements > 0 ? `${totalElements} bản ghi` : 'Chưa có log'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-[8px] transition-colors">
                <X className="w-3.5 h-3.5" /> Xóa filter
              </button>
            )}
            <button onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-[8px] transition-colors text-gray-700">
              <Filter className="w-4 h-4" /> Lọc
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">User ID</label>
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="UUID người dùng"
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922] font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Từ</label>
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Đến</label>
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full h-9 px-3 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922]"
                />
              </div>
            </div>
            <button onClick={handleFilter}
              className="mt-4 bg-[#639922] hover:bg-[#4a7219] text-white text-sm font-medium px-4 py-2 rounded-[8px] transition-colors">
              Áp dụng
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        )}

        {/* Table */}
        {!loading && logs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">Thời gian</th>
                  <th className="text-left px-5 py-3.5">Người dùng</th>
                  <th className="text-left px-5 py-3.5">Hành động</th>
                  <th className="text-left px-5 py-3.5">Target ID</th>
                  <th className="text-left px-5 py-3.5">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 text-xs">{log.username}</p>
                      <p className="text-gray-400 text-[10px] font-mono">{log.userId}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs font-mono truncate max-w-[140px]">
                      {log.targetId ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs font-mono truncate max-w-[200px]">
                      {log.payload ?? '—'}
                    </td>
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

        {!loading && logs.length === 0 && !error && (
          <div className="text-center py-16 text-gray-400 text-sm">Không có log nào.</div>
        )}
      </div>
    </div>
  )
}