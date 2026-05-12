import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { useStomp } from '@/hooks/useStomp'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Sprout, Thermometer, Wind, Droplets, RefreshCw,
  Play, Square, ArrowLeft, Wifi, WifiOff, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────
function now24h() {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// ── Sensor Card ───────────────────────────────────────────────────────────────
function SensorCard({ label, value, unit, sub, icon, color, live }: {
  label: string; value: string; unit?: string
  sub: string; icon: React.ReactNode; color: string; live?: boolean
}) {
  return (
    <div className="bg-white rounded-[12px] px-6 py-5 flex items-start justify-between shadow-sm border border-gray-100">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">{label}</p>
          {live && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data text-4xl font-semibold" style={{ color }}>
            {value}
          </span>
          {unit && <span className="text-lg font-medium" style={{ color }}>{unit}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-2">{sub}</p>
      </div>
      <div className="text-gray-200 mt-1">{icon}</div>
    </div>
  )
}

// ── Range Toggle ──────────────────────────────────────────────────────────────
function RangeToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {['24h', '7 ngày'].map((opt) => (
        <button key={opt} onClick={() => onChange(opt)}
          className={cn('text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
            value === opt ? 'bg-[#639922] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DeviceDashboard() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()
  const [pumpOn, setPumpOn] = useState(false)
  const [soilRange, setSoilRange] = useState('24h')
  const [airRange, setAirRange] = useState('24h')

  // STOMP realtime
  const { sensor, publish } = useStomp(deviceId ?? null)

  // API history charts
  const { startDate, endDate } = now24h()

  const { data: soilHistory, refetch: refetchSoil } = useQuery({
    queryKey: ['soil-history', deviceId, soilRange],
    queryFn: () => dashboardApi.getSoilHistory(deviceId!, startDate, endDate,
      soilRange === '24h' ? 'HOURLY' : 'DAILY'),
    enabled: !!deviceId,
    select: (res) => res.data.data.map((d) => ({
      time: fmtTime(d.timestamp),
      value: +(d.avgMoisturePercent ?? 0).toFixed(1),
    })),
  })

  const { data: airHistory } = useQuery({
    queryKey: ['air-history', deviceId, airRange],
    queryFn: () => dashboardApi.getAirHistory(deviceId!, startDate, endDate,
      airRange === '24h' ? 'HOURLY' : 'DAILY'),
    enabled: !!deviceId,
    select: (res) => res.data.data.map((d) => ({
      time: fmtTime(d.timestamp),
      temp: +(d.avgTemperatureCelsius ?? 0).toFixed(1),
      humidity: +(d.avgHumidityPercent ?? 0).toFixed(1),
    })),
  })

  const handlePump = (on: boolean) => {
    if (!deviceId) return
    publish(`/app/dashboard/${deviceId}`, { command: on ? 'ON' : 'OFF' })
    setPumpOn(on)
  }

  const lastUpdated = sensor.lastUpdated
    ? sensor.lastUpdated.toLocaleTimeString('vi-VN')
    : 'Chờ dữ liệu...'

  const fmt = (v: number | null) => v !== null ? String(+v.toFixed(1)) : '--'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/devices')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {sensor.statusDelay && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Dữ liệu có thể bị trễ
            </div>
          )}
          <div className={cn('flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full',
            sensor.connected ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400')}>
            {sensor.connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {sensor.connected ? 'Realtime' : 'Disconnected'}
          </div>
          <button onClick={() => refetchSoil()}
            className="p-2 rounded-[8px] border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <div className={cn('w-2.5 h-2.5 rounded-full',
            sensor.deviceStatus === 'online' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : 'bg-gray-300')} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* Sensor Cards */}
        <div className="grid grid-cols-4 gap-4">
          <SensorCard label="Độ ẩm đất" unit="%" sub={`Cập nhật ${lastUpdated}`}
            value={fmt(sensor.soilMoisture)} color="var(--color-soil)"
            icon={<Sprout className="w-8 h-8" />} live={sensor.connected} />
          <SensorCard label="Nhiệt độ" unit="°C" sub={`Cập nhật ${lastUpdated}`}
            value={fmt(sensor.temperature)} color="var(--color-temp)"
            icon={<Thermometer className="w-8 h-8" />} live={sensor.connected} />
          <SensorCard label="Độ ẩm KK" unit="%" sub="Không khí"
            value={fmt(sensor.humidity)} color="var(--color-humidity)"
            icon={<Wind className="w-8 h-8" />} live={sensor.connected} />
          <SensorCard label="Nước tưới hôm nay"
            unit="ml" sub={sensor.waterToday !== null ? `${sensor.waterToday} ml tổng` : 'Chưa có dữ liệu'}
            value={sensor.waterToday !== null ? String(sensor.waterToday) : '--'}
            color="var(--color-water)" icon={<Droplets className="w-8 h-8" />} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Sprout className="w-4 h-4 text-[#639922]" /> Độ ẩm đất
              </div>
              <RangeToggle value={soilRange} onChange={setSoilRange} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={soilHistory ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#639922" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#639922" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Độ ẩm đất']} />
                <Area type="monotone" dataKey="value" stroke="#639922" strokeWidth={2}
                  fill="url(#soilGrad)" dot={{ r: 3, fill: '#639922', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Thermometer className="w-4 h-4 text-[#e24b4a]" /> Nhiệt độ / Độ ẩm KK
              </div>
              <RangeToggle value={airRange} onChange={setAirRange} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={airHistory ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={3} />
                <YAxis yAxisId="temp" domain={[20, 40]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="hum" orientation="right" domain={[40, 90]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="temp" type="monotone" dataKey="temp" name="Nhiệt độ (°C)"
                  stroke="#e24b4a" strokeWidth={2} dot={{ r: 3, fill: '#e24b4a', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line yAxisId="hum" type="monotone" dataKey="humidity" name="Độ ẩm KK (%)"
                  stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pump Control */}
        <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-5">
            <Droplets className="w-4 h-4 text-[#639922]" /> Điều khiển bơm nhanh
          </div>
          <div className="flex items-center gap-2 mb-5">
            <div className={cn('w-3 h-3 rounded-full transition-all',
              pumpOn ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300')} />
            <span className="text-sm text-gray-600 font-medium">
              {pumpOn ? 'Bơm đang hoạt động' : 'Bơm đã tắt'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handlePump(true)} disabled={pumpOn}
              className={cn('flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-semibold transition-all',
                pumpOn ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#639922] text-white hover:bg-[#4a7219] shadow-sm')}>
              <Play className="w-4 h-4" /> Bật bơm
            </button>
            <button onClick={() => handlePump(false)} disabled={!pumpOn}
              className={cn('flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-semibold border transition-all',
                !pumpOn ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                  : 'border-red-200 text-red-500 hover:bg-red-50')}>
              <Square className="w-4 h-4" /> Tắt bơm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}