import { useEffect, useState } from 'react'
import { Settings, Loader2, AlertCircle, Save, Download } from 'lucide-react'
import api from '@/api/axios'

interface SystemConfig {
  key: string
  value: string
  updatedAt: string
}

const configApi = {
  getAll: () => api.get<SystemConfig[]>('/api/admin/config'),
  updateRetention: (value: string) => api.put('/api/admin/config/retention', { value }),
  updateSampleRate: (value: string) => api.put('/api/admin/config/sample-rate', { value }),
  updateTimezone: (value: string) => api.put('/api/admin/config/timezone', { value }),
  backup: () => api.get('/api/admin/config/backup', { responseType: 'blob' }),
}

const CONFIG_META: Record<string, { label: string; description: string; unit: string; endpoint: string }> = {
  retention: {
    label: 'Thời gian lưu trữ',
    description: 'Số ngày lưu dữ liệu cảm biến',
    unit: 'ngày',
    endpoint: 'retention',
  },
  'sample-rate': {
    label: 'Tần suất lấy mẫu',
    description: 'Thời gian giữa các lần đọc sensor (giây)',
    unit: 'giây',
    endpoint: 'sample-rate',
  },
  timezone: {
    label: 'Múi giờ',
    description: 'Múi giờ hệ thống (VD: Asia/Ho_Chi_Minh)',
    unit: '',
    endpoint: 'timezone',
  },
}

function ConfigRow({ config, onSaved }: { config: SystemConfig; onSaved: () => void }) {
  const meta = CONFIG_META[config.key]
  const [value, setValue] = useState(config.value)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const changed = value !== config.value

  const handleSave = async () => {
    setSaving(true)
    try {
      if (config.key === 'retention') await configApi.updateRetention(value)
      else if (config.key === 'sample-rate') await configApi.updateSampleRate(value)
      else if (config.key === 'timezone') await configApi.updateTimezone(value)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      onSaved()
    } catch { /* ignore */ } finally {
      setSaving(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN')

  return (
    <div className="px-6 py-5 border-b border-gray-50 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">
            {meta?.label ?? config.key}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{meta?.description}</p>
          <p className="text-[10px] text-gray-300 mt-1">Cập nhật: {formatDate(config.updatedAt)}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-9 w-48 px-3 pr-10 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922] font-mono"
            />
            {meta?.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {meta.unit}
              </span>
            )}
          </div>

          {changed && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 h-9 px-3 bg-[#639922] hover:bg-[#4a7219] text-white rounded-[8px] text-xs font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Lưu
            </button>
          )}

          {success && (
            <span className="text-xs text-green-600 font-medium">✓ Đã lưu</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const fetchConfigs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await configApi.getAll()
      setConfigs(res.data)
    } catch {
      setError('Không thể tải cấu hình hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConfigs() }, [])

  const handleBackup = async () => {
    setDownloading(true)
    try {
      const res = await configApi.backup()
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `config-backup-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-[#639922]" />
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Cấu hình hệ thống</h1>
              <p className="text-sm text-gray-500 mt-0.5">{configs.length} cấu hình</p>
            </div>
          </div>
          <button
            onClick={handleBackup}
            disabled={downloading}
            className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-[8px] transition-colors text-gray-700 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Backup
          </button>
        </div>

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

        {/* Config list */}
        {!loading && configs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {configs.map((c) => (
              <ConfigRow key={c.key} config={c} onSaved={fetchConfigs} />
            ))}
          </div>
        )}

        {!loading && configs.length === 0 && !error && (
          <div className="text-center py-16 text-gray-400 text-sm">Chưa có cấu hình nào.</div>
        )}
      </div>
    </div>
  )
}