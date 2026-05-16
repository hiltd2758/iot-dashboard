import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/admin'
import type { DeviceDTO } from '@/types'
import {
  Cpu, Wifi, WifiOff, ArrowLeft, Loader2, AlertCircle, RefreshCw,
  User, Hash, Radio, Thermometer, Droplets, Calendar, Clock, Server, Activity
} from 'lucide-react'

export default function AdminDeviceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [device, setDevice] = useState<DeviceDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDevice = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getDeviceDetail(id)
      setDevice(res.data.data)
    } catch {
      setError('Không thể tải thông tin thiết bị.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDevice() }, [id])

  const d = device as any

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('vi-VN') : '—'

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-main)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/devices')}
            className="p-2 rounded-[var(--radius-sm)] border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Quay về"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Chi tiết thiết bị
          </h1>
        </div>
        <button
          onClick={loadDevice}
          className="p-2 rounded-[var(--radius-sm)] border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto scrollbar-thin space-y-4">

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-[var(--radius)] px-5 py-3.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16 gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải...
          </div>
        )}

        {!loading && device && (
          <>
            {/* Header card */}
            <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-6 flex items-center gap-5">
              <div
                className="w-14 h-14 rounded-[var(--radius)] flex items-center justify-center shrink-0"
                style={{ background: 'var(--bg-main)' }}
              >
                <Cpu className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {device.name}
                </div>
                <div className="text-sm mt-0.5 font-mono-data" style={{ color: 'var(--text-secondary)' }}>
                  {d.chipId}
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                device.status === 'online'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {device.status === 'online'
                  ? <Wifi className="w-3 h-3" />
                  : <WifiOff className="w-3 h-3" />}
                {device.status}
              </span>
            </div>

            {/* Thông tin chung */}
            <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm divide-y divide-gray-50">
              <SectionTitle title="Thông tin chung" />
              <InfoRow icon={<Hash />}     label="Device ID"  value={device.id} mono />
              <InfoRow icon={<User />}     label="Người dùng" value={d.username ?? '—'} />
              <InfoRow icon={<Calendar />} label="Claimed at" value={formatDate(d.claimedAt)} mono />
              <InfoRow icon={<Clock />}    label="Last seen"  value={formatDate(d.lastSeenAt)} mono />
            </div>

            {/* Mạng & phần cứng */}
            <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm divide-y divide-gray-50">
              <SectionTitle title="Mạng & phần cứng" />
              <InfoRow icon={<Radio />}    label="IP"         value={d.ip ?? '—'} mono />
              <InfoRow icon={<Wifi />}     label="WiFi RSSI"  value={d.wifiRssi != null ? `${d.wifiRssi} dBm` : '—'} />
              <InfoRow icon={<Server />}   label="Free Heap"  value={d.freeHeap != null ? `${d.freeHeap.toLocaleString()} bytes` : '—'} />
              <InfoRow icon={<Activity />} label="Uptime"     value={formatUptime(d.uptime)} />
            </div>

            {/* Cấu hình tưới */}
            <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm divide-y divide-gray-50">
              <SectionTitle title="Cấu hình tưới" />
              <InfoRow icon={<Droplets />} label="Relay"        value={d.statusRelay ? 'Đang bật' : 'Tắt'} />
              <InfoRow icon={<Droplets />} label="Auto water"   value={device.autoWaterEnabled ? 'Bật' : 'Tắt'} />
              <InfoRow icon={<Droplets />} label="Ngưỡng thấp"  value={`${device.moistureThresholdLow}%`} />
              <InfoRow icon={<Droplets />} label="Ngưỡng cao"   value={`${device.moistureThresholdHigh}%`} />
            </div>

            {/* Hiệu chỉnh */}
            <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm divide-y divide-gray-50">
              <SectionTitle title="Hiệu chỉnh (offset)" />
              <InfoRow icon={<Thermometer />} label="Độ ẩm đất"       value={`${device.soilMoistureOffset}`} />
              <InfoRow icon={<Thermometer />} label="Nhiệt độ"         value={`${device.airTemperatureOffset}`} />
              <InfoRow icon={<Thermometer />} label="Độ ẩm không khí"  value={`${device.airHumidityOffset}`} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="px-6 py-3" style={{ background: 'rgba(0,0,0,0.02)' }}>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </span>
    </div>
  )
}

function InfoRow({ icon, label, value, mono }: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <span className="text-gray-300 shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      <span className="text-sm w-40 shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span
        className={`text-sm font-medium truncate ${mono ? 'font-mono-data' : ''}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </span>
    </div>
  )
}