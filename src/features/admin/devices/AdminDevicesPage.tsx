    import { useEffect, useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { adminApi } from '@/api/admin'
    import type { DeviceDTO } from '@/types'
    import {
        Cpu, Wifi, WifiOff, Loader2, AlertCircle, ChevronLeft, ChevronRight, Trash2
    } from 'lucide-react'

    export default function AdminDevicesPage() {
        const navigate = useNavigate()
        const [devices, setDevices] = useState<DeviceDTO[]>([])
        const [loading, setLoading] = useState(false)
        const [error, setError] = useState<string | null>(null)
        const [page, setPage] = useState(0)
        const [totalPages, setTotalPages] = useState(0)
        const [totalElements, setTotalElements] = useState(0)

        const fetchDevices = async (p: number) => {
            setLoading(true)
            setError(null)
            try {
                const res = await adminApi.getAllDevices(p, 10)
                const pageData = res.data.data
                setDevices(pageData.content)
                setTotalPages(pageData.totalPages)
                setTotalElements(pageData.totalElements)
            } catch {
                setError('Không thể tải danh sách thiết bị.')
            } finally {
                setLoading(false)
            }
        }

        useEffect(() => { fetchDevices(page) }, [page])

        const handleDelete = async (e: React.MouseEvent, id: string) => {
            e.stopPropagation()
            if (!confirm('Xác nhận xóa thiết bị này?')) return
            try {
                await adminApi.deleteDevice(id)
                fetchDevices(page)
            } catch {
                alert('Xóa thất bại.')
            }
        }

        return (
            <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-main, #f5f7f5)' }}>
                <div className="max-w-5xl mx-auto space-y-5">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">Quản lý thiết bị</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {totalElements > 0 ? `${totalElements} thiết bị` : 'Chưa có thiết bị'}
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải...
                        </div>
                    )}

                    {/* Table */}
                    {!loading && devices.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                                        <th className="text-left px-5 py-3.5">Thiết bị</th>
                                        <th className="text-left px-5 py-3.5">Chip ID</th>
                                        <th className="text-left px-5 py-3.5">Người dùng</th>
                                        <th className="text-left px-5 py-3.5">Trạng thái</th>
                                        <th className="text-left px-5 py-3.5">IP</th>
                                        <th className="text-left px-5 py-3.5">Last seen</th>
                                        <th className="px-5 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {devices.map((d) => (
                                        <tr key={d.id} onClick={() => navigate(`/admin/devices/${d.id}`)} className="hover:bg-gray-50/60 transition-colors cursor-pointer">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100">
                                                        <Cpu className="w-3.5 h-3.5 text-gray-500" />
                                                    </div>
                                                    <span className="font-medium text-gray-800 truncate max-w-[160px]">{d.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{d.chipId ?? '—'}</td>
                                            <td className="px-5 py-3.5 text-gray-600">{d.username ?? <span className="text-gray-300">Chưa có</span>}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${d.status === 'online'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {d.status === 'online'
                                                        ? <Wifi className="w-3 h-3" />
                                                        : <WifiOff className="w-3 h-3" />}
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{(d as any).ip ?? '—'}</td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs">
                                                {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString('vi-VN') : '—'}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={(e) => handleDelete(e, d.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                                                    title="Xóa thiết bị"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                                    <span>Trang {page + 1} / {totalPages}</span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setPage((p) => p - 1)}
                                            disabled={page === 0}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setPage((p) => p + 1)}
                                            disabled={page >= totalPages - 1}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && devices.length === 0 && !error && (
                        <div className="text-center py-16 text-gray-400 text-sm">Không có thiết bị nào.</div>
                    )}
                </div>
            </div>
        )
    }