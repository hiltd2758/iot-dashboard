import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Plus, Loader2, AlertCircle, Trash2, Pencil, Power, X, Check } from 'lucide-react'
import api from '@/api/axios'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────
interface ScheduleDTO {
  id: string
  deviceId: string
  cronExpression: string
  waterAmountMl: number
  enabled: boolean
  nextRunAt: string | null
}

// ── API ───────────────────────────────────────────────────────────────────────
const scheduleApi = {
  getAll: (deviceId: string) =>
    api.get<{ data: ScheduleDTO[] }>(`/api/devices/${deviceId}/schedules`),
  create: (deviceId: string, body: { cronExpression: string; waterAmountMl: number; enabled: boolean }) =>
    api.post<{ data: ScheduleDTO }>(`/api/devices/${deviceId}/schedules`, body),
  update: (deviceId: string, id: string, body: { cronExpression: string; waterAmountMl: number; enabled: boolean }) =>
    api.put<{ data: ScheduleDTO }>(`/api/devices/${deviceId}/schedules/${id}`, body),
  toggle: (deviceId: string, id: string, enabled: boolean) =>
    api.patch(`/api/devices/${deviceId}/schedules/${id}/toggle`, { enabled }),
  delete: (deviceId: string, id: string) =>
    api.delete(`/api/devices/${deviceId}/schedules/${id}`),
}

// ── Cron helpers ──────────────────────────────────────────────────────────────
const CRON_PRESETS = [
  { label: 'Mỗi ngày 6:00', value: '0 0 6 * * ?' },
  { label: 'Mỗi ngày 18:00', value: '0 0 18 * * ?' },
  { label: 'Mỗi ngày 6:00 & 18:00', value: '0 0 6,18 * * ?' },
  { label: 'Thứ 2-6 lúc 7:00', value: '0 0 7 * * MON-FRI' },
  { label: 'Thứ 7 & CN lúc 8:00', value: '0 0 8 * * SAT,SUN' },
  { label: 'Tuỳ chỉnh', value: '' },
]

function fmtNext(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN')
}

// ── Schedule Form Modal ───────────────────────────────────────────────────────
function ScheduleModal({
  deviceId,
  initial,
  onClose,
  onSaved,
}: {
  deviceId: string
  initial?: ScheduleDTO
  onClose: () => void
  onSaved: () => void
}) {
  const [preset, setPreset] = useState(
    initial ? (CRON_PRESETS.find((p) => p.value === initial.cronExpression)?.value ?? '') : CRON_PRESETS[0].value
  )
  const [cron, setCron] = useState(initial?.cronExpression ?? '0 0 6 * * ?')
  const [amount, setAmount] = useState(String(initial?.waterAmountMl ?? 500))
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePreset = (val: string) => {
    setPreset(val)
    if (val) setCron(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cron.trim()) { setError('Vui lòng nhập biểu thức cron'); return }
    const ml = parseFloat(amount)
    if (isNaN(ml) || ml <= 0) { setError('Lượng nước phải > 0'); return }
    setSaving(true)
    try {
      const body = { cronExpression: cron.trim(), waterAmountMl: ml, enabled }
      if (initial) {
        await scheduleApi.update(deviceId, initial.id, body)
      } else {
        await scheduleApi.create(deviceId, body)
      }
      onSaved()
      onClose()
    } catch {
      setError('Lưu thất bại, thử lại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">{initial ? 'Chỉnh sửa lịch' : 'Tạo lịch tưới'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preset */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">Chọn nhanh</label>
            <div className="flex flex-wrap gap-1.5">
              {CRON_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePreset(p.value)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-colors',
                    (preset === p.value && p.value !== '') || (p.value === '' && !CRON_PRESETS.slice(0,-1).map(x=>x.value).includes(cron))
                      ? 'bg-[#639922] text-white border-[#639922]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#639922]'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cron */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Biểu thức Cron *</label>
            <input
              value={cron}
              onChange={(e) => { setCron(e.target.value); setPreset('') }}
              placeholder="0 0 6 * * ?"
              className="w-full h-10 px-3 border border-gray-200 rounded-[8px] text-sm font-mono focus:outline-none focus:border-[#639922]"
            />
            <p className="text-[10px] text-gray-400 mt-1">Giây Phút Giờ Ngày Tháng Thứ</p>
          </div>

          {/* Water amount */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Lượng nước (ml) *</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922]"
            />
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700">Kích hoạt ngay</span>
            <button
              type="button"
              onClick={() => setEnabled((v) => !v)}
              className={cn('relative w-11 h-6 rounded-full transition-colors', enabled ? 'bg-[#639922]' : 'bg-gray-200')}
            >
              <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform', enabled ? 'translate-x-6' : 'translate-x-1')} />
            </button>
          </div>

          {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 border border-gray-200 rounded-[8px] text-sm text-gray-600 hover:bg-gray-50">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 bg-[#639922] hover:bg-[#4a7219] text-white rounded-[8px] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {initial ? 'Lưu' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WateringSchedulePage() {
  const { deviceId } = useParams<{ deviceId: string }>()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<'create' | ScheduleDTO | null>(null)

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['schedules', deviceId],
    queryFn: () => scheduleApi.getAll(deviceId!).then((r) => r.data.data),
    enabled: !!deviceId,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['schedules', deviceId] })

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      scheduleApi.toggle(deviceId!, id, enabled),
    onSuccess: invalidate,
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => scheduleApi.delete(deviceId!, id),
    onSuccess: invalidate,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-[#639922]" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Lịch tưới</h1>
            <p className="text-xs text-gray-400 mt-0.5">{schedules.length} lịch đã tạo</p>
          </div>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-1.5 bg-[#639922] hover:bg-[#4a7219] text-white text-sm font-medium px-4 py-2 rounded-[8px] transition-colors"
        >
          <Plus className="w-4 h-4" /> Tạo lịch
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-3 overflow-auto">

        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> Không thể tải lịch tưới
          </div>
        )}

        {!isLoading && schedules.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600 text-sm">Chưa có lịch tưới</p>
            <p className="text-xs text-gray-400 mt-1">Tạo lịch để hệ thống tự động tưới</p>
            <button onClick={() => setModal('create')}
              className="mt-4 flex items-center gap-1.5 bg-[#639922] hover:bg-[#4a7219] text-white text-sm font-medium px-4 py-2 rounded-[8px] transition-colors">
              <Plus className="w-4 h-4" /> Tạo lịch đầu tiên
            </button>
          </div>
        )}

        {schedules.map((s) => (
          <div key={s.id} className={cn(
            'bg-white rounded-[12px] border shadow-sm p-5 flex items-center gap-4 transition-all',
            s.enabled ? 'border-gray-100' : 'border-gray-100 opacity-60'
          )}>
            {/* Toggle */}
            <button
              onClick={() => toggle({ id: s.id, enabled: !s.enabled })}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0',
                s.enabled ? 'bg-green-50 text-[#639922]' : 'bg-gray-100 text-gray-400'
              )}
            >
              <Power className="w-4 h-4" />
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-semibold text-gray-800">{s.cronExpression}</span>
                <span className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                  s.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                )}>
                  {s.enabled ? 'Đang bật' : 'Tắt'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="text-[#639922] font-semibold">{s.waterAmountMl} ml</span>
                <span>·</span>
                <span>Lần tới: {fmtNext(s.nextRunAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setModal(s)}
                className="p-2 rounded-lg text-gray-300 hover:text-[#639922] hover:bg-green-50 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => { if (confirm('Xóa lịch này?')) remove(s.id) }}
                className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <ScheduleModal
          deviceId={deviceId!}
          initial={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
          onSaved={invalidate}
        />
      )}
    </div>
  )
}