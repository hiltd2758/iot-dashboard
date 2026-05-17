import { useState, useEffect, useMemo } from 'react'
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
  Play, Square, ArrowLeft, Wifi, WifiOff, AlertTriangle, Database,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getDateRange(rangeName: string) {
  const end = new Date()
  const start = new Date(
    rangeName === '24h'
      ? end.getTime() - 24 * 60 * 60 * 1000
      : end.getTime() - 7 * 24 * 60 * 60 * 1000,
  )
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    interval: rangeName === '24h' ? 'HOURLY' : 'DAILY',
  }
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

function fmtTimeFull(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

type DataSource = 'live' | 'db' | 'loading'

function SensorCard({
  label, value, unit, sub, icon, color, dataSource,
}: {
  label: string
  value: string
  unit?: string
  sub: string
  icon: React.ReactNode
  color: string
  dataSource: DataSource
}) {
  return (
    <div className="bg-white rounded-[12px] px-6 py-5 flex items-start justify-between shadow-sm border border-gray-100">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">{label}</p>
          {dataSource === 'live' && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          )}
          {dataSource === 'db' && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
              <Database className="w-2.5 h-2.5" />
              DB
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          {dataSource === 'loading' ? (
            <span className="w-16 h-9 bg-gray-100 rounded animate-pulse inline-block" />
          ) : (
            <>
              <span className="font-mono text-4xl font-semibold" style={{ color }}>{value}</span>
              {unit && <span className="text-lg font-medium" style={{ color }}>{unit}</span>}
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 truncate">{sub}</p>
      </div>
      <div className="text-gray-200 mt-1 ml-2 shrink-0">{icon}</div>
    </div>
  )
}

function RangeToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {(['24h', '7 ngày'] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
            value === opt ? 'bg-[#639922] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Poll interval (ms) ───────────────────────────────────────────────────────
const POLL_INTERVAL = 4_000

export default function DeviceDashboard() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()
  const [pumpOn, setPumpOn] = useState(false)
  const [soilRange, setSoilRange] = useState('24h')
  const [airRange, setAirRange] = useState('24h')

  // STOMP vẫn giữ — nếu sau này fix được thì tự dùng lại
  const { sensor, publish, liveChartData } = useStomp(deviceId ?? null)

  // ── REST polling — cards (5s) ─────────────────────────────────────────────
  const { data: summaryDB, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary', deviceId],
    queryFn: () => dashboardApi.getDashboardSummary(deviceId!),
    enabled: !!deviceId,
    refetchInterval: POLL_INTERVAL,
    staleTime: 0,
    select: (res) => res.data.data,
  })

  const { data: latestSoilDB, isLoading: soilLoading } = useQuery({
    queryKey: ['latest-soil', deviceId],
    queryFn: () => dashboardApi.getLatestSoil(deviceId!),
    enabled: !!deviceId,
    refetchInterval: POLL_INTERVAL,
    staleTime: 0,
    select: (res) => res.data.data,
  })

  const { data: latestAirDB, isLoading: airLoading } = useQuery({
    queryKey: ['latest-air', deviceId],
    queryFn: () => dashboardApi.getLatestAir(deviceId!),
    enabled: !!deviceId,
    refetchInterval: POLL_INTERVAL,
    staleTime: 0,
    select: (res) => res.data.data,
  })

  // ── REST polling — chart history (30s) ───────────────────────────────────
  const { data: soilHistory, refetch: refetchSoil, isFetching: soilFetching } = useQuery({
    queryKey: ['soil-history', deviceId, soilRange],
    queryFn: () => {
      const { startDate, endDate } = getDateRange(soilRange)
      return dashboardApi.getSoilHistory(
        deviceId!,
        startDate,
        endDate,
        soilRange === '24h' ? 'HOURLY' : 'DAILY',
      )
    },
    enabled: !!deviceId,
    refetchInterval: 30_000,
    select: (res) =>
      res.data.data.map((d) => ({
        time: soilRange === '24h' ? fmtTime(d.timestamp.toString()) : fmtDate(d.timestamp.toString()),
        value: +(d.avgMoisturePercent ?? 0).toFixed(1),
      })),
  })

  const { data: airHistory, isFetching: airFetching } = useQuery({
    queryKey: ['air-history', deviceId, airRange],
    queryFn: () => {
      const { startDate, endDate } = getDateRange(airRange)
      return dashboardApi.getAirHistory(
        deviceId!,
        startDate,
        endDate,
        airRange === '24h' ? 'HOURLY' : 'DAILY',
      )
    },
    enabled: !!deviceId,
    refetchInterval: 30_000,
    select: (res) =>
      res.data.data.map((d) => ({
        time: airRange === '24h' ? fmtTime(d.timestamp.toString()) : fmtDate(d.timestamp.toString()),
        temp: +(d.avgTemperatureCelsius ?? 0).toFixed(1),
        humidity: +(d.avgHumidityPercent ?? 0).toFixed(1),
      })),
  })

  // ── Tích lũy poll points mỗi 5s để vẽ đường realtime trên chart ──────────
  // Mỗi lần summaryDB thay đổi (5s/lần) → thêm 1 điểm mới vào pollChartData
  const [pollChartData, setPollChartData] = useState<
    { time: string; soilMoisture: number | null; temperature: number | null; humidity: number | null }[]
  >([])

  useEffect(() => {
    if (!summaryDB) return
    const point = {
      time: fmtTimeFull(new Date()),
      soilMoisture: summaryDB.latestSoilMoisturePercent,
      temperature: summaryDB.latestTemperatureCelsius,
      humidity: summaryDB.latestHumidityPercent,
    }
    setPollChartData((prev) => [...prev.slice(-50), point])
  }, [summaryDB])

  // ── Chart data: REST history làm nền, poll/live points append cuối ────────
  // Ưu tiên: STOMP live > poll 5s > REST history thuần
  const extraPoints = sensor.connected && liveChartData.length > 0
    ? liveChartData
    : pollChartData

  const soilChartData = useMemo(() => {
    const base = soilHistory ?? []
    if (extraPoints.length === 0) return base
    const live = extraPoints.map((p) => ({
      time: p.time,
      value: +(p.soilMoisture ?? 0).toFixed(1),
    }))
    const lastRestTime = base.at(-1)?.time
    return [...base, ...live.filter((p) => p.time !== lastRestTime)]
  }, [soilHistory, extraPoints])

  const airChartData = useMemo(() => {
    const base = airHistory ?? []
    if (extraPoints.length === 0) return base
    const live = extraPoints.map((p) => ({
      time: p.time,
      temp: +(p.temperature ?? 0).toFixed(1),
      humidity: +(p.humidity ?? 0).toFixed(1),
    }))
    const lastRestTime = base.at(-1)?.time
    return [...base, ...live.filter((p) => p.time !== lastRestTime)]
  }, [airHistory, extraPoints])

  // ── Merge STOMP + REST ───────────────────────────────────────────────────
  const isDbLoading = summaryLoading || soilLoading || airLoading

  const deviceStatus = sensor.deviceStatus !== 'unknown'
    ? sensor.deviceStatus
    : summaryDB?.status ?? 'unknown'

  const statusDelay = sensor.statusDelay

  const soilMoisture = sensor.connected && sensor.soilMoisture !== null
    ? sensor.soilMoisture
    : summaryDB?.latestSoilMoisturePercent ?? latestSoilDB?.moisturePercent ?? null

  const temperature = sensor.connected && sensor.temperature !== null
    ? sensor.temperature
    : summaryDB?.latestTemperatureCelsius ?? latestAirDB?.temperatureCelsius ?? null

  const humidity = sensor.connected && sensor.humidity !== null
    ? sensor.humidity
    : summaryDB?.latestHumidityPercent ?? latestAirDB?.humidityPercent ?? null

  const waterToday = sensor.waterToday ?? summaryDB?.totalWaterAmountMlToday ?? null

  function getSource(liveVal: number | null): DataSource {
    if (isDbLoading) return 'loading'
    if (sensor.connected && liveVal !== null) return 'live'
    return 'db'
  }

  const lastUpdatedLabel = sensor.connected && sensor.lastUpdated
    ? `Live ${sensor.lastUpdated.toLocaleTimeString('vi-VN')}`
    : latestSoilDB?.recordedAt
      ? `DB: ${new Date(latestSoilDB.recordedAt.toString()).toLocaleTimeString('vi-VN')}`
      : 'Chưa có dữ liệu'

  const fmt = (v: number | null) => (v !== null ? String(+v.toFixed(1)) : '--')

  const chartIsLive = sensor.connected && liveChartData.length > 0

  // ── Pump ─────────────────────────────────────────────────────────────────
  const handlePump = async (on: boolean) => {
    if (!deviceId) return
    try {
      if (on) {
        await dashboardApi.startManualWatering(deviceId)
      } else {
        await dashboardApi.stopManualWatering(deviceId, 500)
      }
      setPumpOn(on)
    } catch (err) {
      console.error('Pump control failed', err)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/devices')}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          {statusDelay && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Dữ liệu có thể bị trễ
            </div>
          )}
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full',
            deviceStatus === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500',
          )}>
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              deviceStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400',
            )} />
            {deviceStatus === 'online' ? 'Online' : deviceStatus === 'unknown' ? 'Unknown' : 'Offline'}
          </div>
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full',
            sensor.connected ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-500',
          )}>
            {sensor.connected ? <Wifi className="w-3 h-3" /> : <Database className="w-3 h-3" />}
            {sensor.connected ? 'Realtime' : `Polling ${POLL_INTERVAL / 1000}s`}
          </div>
          <button
            onClick={() => refetchSoil()}
            className={cn(
              'p-2 rounded-[8px] border border-gray-200 hover:bg-gray-50 transition-colors',
              soilFetching && 'animate-spin pointer-events-none opacity-50',
            )}
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-6 overflow-auto">

        {/* Sensor Cards */}
        <div className="grid grid-cols-4 gap-4">
          <SensorCard
            label="Độ ẩm đất" unit="%" sub={lastUpdatedLabel}
            value={fmt(soilMoisture)} color="var(--color-soil)"
            icon={<Sprout className="w-8 h-8" />}
            dataSource={getSource(sensor.soilMoisture)}
          />
          <SensorCard
            label="Nhiệt độ" unit="°C" sub={lastUpdatedLabel}
            value={fmt(temperature)} color="var(--color-temp)"
            icon={<Thermometer className="w-8 h-8" />}
            dataSource={getSource(sensor.temperature)}
          />
          <SensorCard
            label="Độ ẩm KK" unit="%" sub="Không khí"
            value={fmt(humidity)} color="var(--color-humidity)"
            icon={<Wind className="w-8 h-8" />}
            dataSource={getSource(sensor.humidity)}
          />
          <SensorCard
            label="Hôm nay" unit="ml"
            sub={waterToday !== null ? `${waterToday.toFixed(1)} ml tổng` : 'Chưa có dữ liệu'}
            value={waterToday !== null ? waterToday.toFixed(1) : '--'}

            color="var(--color-water)"
            icon={<Droplets className="w-8 h-8" />}
            dataSource={sensor.connected ? 'live' : 'db'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Soil chart */}
          <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Sprout className="w-4 h-4 text-[#639922]" />
                Độ ẩm đất
                {chartIsLive
                  ? <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                    </span>
                  : soilFetching
                    ? <span className="w-3 h-3 border-2 border-[#639922] border-t-transparent rounded-full animate-spin" />
                    : <span className="flex items-center gap-1 text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Poll {POLL_INTERVAL / 1000}s
                      </span>
                }
              </div>
              <RangeToggle value={soilRange} onChange={setSoilRange} />
            </div>

            {soilChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
                Không có dữ liệu trong khoảng thời gian này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={soilChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#639922" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#639922" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                    formatter={(v) => [`${v}%`, 'Độ ẩm đất']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#639922" strokeWidth={2}
                    fill="url(#soilGrad)" dot={{ r: 3, fill: '#639922', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Air chart */}
          <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Thermometer className="w-4 h-4 text-[#e24b4a]" />
                Nhiệt độ / Độ ẩm KK
                {chartIsLive
                  ? <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                    </span>
                  : airFetching
                    ? <span className="w-3 h-3 border-2 border-[#e24b4a] border-t-transparent rounded-full animate-spin" />
                    : <span className="flex items-center gap-1 text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Poll {POLL_INTERVAL / 1000}s
                      </span>
                }
              </div>
              <RangeToggle value={airRange} onChange={setAirRange} />
            </div>

            {airChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
                Không có dữ liệu trong khoảng thời gian này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={airChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
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
            )}
          </div>
        </div>

        {/* Pump Control */}
        <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-5">
            <Droplets className="w-4 h-4 text-[#639922]" />
            Điều khiển bơm nhanh
          </div>
          <div className="flex items-center gap-2 mb-5">
            <div className={cn(
              'w-3 h-3 rounded-full transition-all',
              pumpOn ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300',
            )} />
            <span className="text-sm text-gray-600 font-medium">
              {pumpOn ? 'Bơm đang hoạt động' : 'Bơm đã tắt'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handlePump(true)}
              disabled={pumpOn}
              className={cn(
                'flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-semibold transition-all',
                pumpOn ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#639922] text-white hover:bg-[#4a7219] shadow-sm',
              )}
            >
              <Play className="w-4 h-4" /> Bật bơm
            </button>
            <button
              onClick={() => handlePump(false)}
              disabled={!pumpOn}
              className={cn(
                'flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-semibold border transition-all',
                !pumpOn ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-red-200 text-red-500 hover:bg-red-50',
              )}
            >
              <Square className="w-4 h-4" /> Tắt bơm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}