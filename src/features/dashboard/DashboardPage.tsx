import { useState } from 'react'
import { Sprout, Thermometer, Wind, Droplets, RefreshCw, ChevronDown, Play, Square } from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─── Mock data (sẽ thay bằng MQTT/API sau) ───────────────────────────────────
const SOIL_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${String((15 + i) % 24).padStart(2, '0')}:00`,
  value: Math.round(40 + Math.random() * 30),
}))

const TEMP_HUMIDITY_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${String((15 + i) % 24).padStart(2, '0')}:00`,
  temp: +(28 + Math.random() * 6).toFixed(1),
  humidity: +(60 + Math.random() * 20).toFixed(1),
}))

// ─── Sensor Card ─────────────────────────────────────────────────────────────
interface SensorCardProps {
  label: string
  value: string | number
  unit: string
  sub: string
  icon: React.ReactNode
  color: string
}

function SensorCard({ label, value, unit, sub, icon, color }: SensorCardProps) {
  return (
    <div className="bg-white rounded-[12px] px-6 py-5 flex items-start justify-between shadow-sm border border-gray-100">
      <div>
        <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-3">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data text-4xl font-semibold" style={{ color }}>{value}</span>
          <span className="text-lg font-medium" style={{ color }}>{unit}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">{sub}</p>
      </div>
      <div className="text-gray-200 mt-1">{icon}</div>
    </div>
  )
}

// ─── Chart range toggle ───────────────────────────────────────────────────────
function RangeToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {['24h', '7 ngày'].map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
            value === opt
              ? 'bg-[#639922] text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [pumpOn, setPumpOn] = useState(false)
  const [soilRange, setSoilRange] = useState('24h')
  const [airRange, setAirRange] = useState('24h')

  const latestSoil = SOIL_DATA[SOIL_DATA.length - 1]?.value ?? 0
  const latestTemp = TEMP_HUMIDITY_DATA[TEMP_HUMIDITY_DATA.length - 1]?.temp ?? 0
  const latestHumidity = TEMP_HUMIDITY_DATA[TEMP_HUMIDITY_DATA.length - 1]?.humidity ?? 0
  const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-200 rounded-[8px] px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span>Vườn A – ESP32</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 rounded-[8px] border border-gray-200 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-6 overflow-auto">
        {/* Sensor Cards */}
        <div className="grid grid-cols-4 gap-4">
          <SensorCard
            label="Độ ẩm đất"
            value={latestSoil}
            unit="%"
            sub={`Cập nhật ${now}`}
            color="var(--color-soil)"
            icon={<Sprout className="w-8 h-8" />}
          />
          <SensorCard
            label="Nhiệt độ"
            value={latestTemp}
            unit="°C"
            sub={`Cập nhật ${now}`}
            color="var(--color-temp)"
            icon={<Thermometer className="w-8 h-8" />}
          />
          <SensorCard
            label="Độ ẩm KK"
            value={latestHumidity}
            unit="%"
            sub="Không khí"
            color="var(--color-humidity)"
            icon={<Wind className="w-8 h-8" />}
          />
          <SensorCard
            label="Nước tưới hôm nay"
            value={1110}
            unit="ml"
            sub="3 lần tưới hôm nay"
            color="var(--color-water)"
            icon={<Droplets className="w-8 h-8" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Soil Moisture Chart */}
          <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Sprout className="w-4 h-4 text-[#639922]" />
                Độ ẩm đất 24h
              </div>
              <RangeToggle value={soilRange} onChange={setSoilRange} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={SOIL_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#639922" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#639922" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={3} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Độ ẩm đất']}
                />
                <Area type="monotone" dataKey="value" stroke="#639922" strokeWidth={2}
                  fill="url(#soilGrad)" dot={{ r: 3, fill: '#639922', strokeWidth: 0 }}
                  activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Temp & Humidity Chart */}
          <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Thermometer className="w-4 h-4 text-[#e24b4a]" />
                Nhiệt độ / Độ ẩm KK
              </div>
              <RangeToggle value={airRange} onChange={setAirRange} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={TEMP_HUMIDITY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={3} />
                <YAxis yAxisId="temp" domain={[20, 40]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="hum" orientation="right" domain={[40, 90]} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
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
            <Droplets className="w-4 h-4 text-[#639922]" />
            Điều khiển bơm nhanh
          </div>
          <div className="flex items-center gap-2 mb-5">
            <div className={cn(
              'w-3 h-3 rounded-full transition-colors',
              pumpOn ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'
            )} />
            <span className="text-sm text-gray-600 font-medium">
              {pumpOn ? 'Bơm đang hoạt động' : 'Bơm đã tắt'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPumpOn(true)}
              disabled={pumpOn}
              className={cn(
                'flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-semibold transition-all',
                pumpOn
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#639922] text-white hover:bg-[#4a7219] shadow-sm'
              )}
            >
              <Play className="w-4 h-4" />
              Bật bơm
            </button>
            <button
              onClick={() => setPumpOn(false)}
              disabled={!pumpOn}
              className={cn(
                'flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-semibold border transition-all',
                !pumpOn
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white'
                  : 'border-red-200 text-red-500 hover:bg-red-50'
              )}
            >
              <Square className="w-4 h-4" />
              Tắt bơm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}