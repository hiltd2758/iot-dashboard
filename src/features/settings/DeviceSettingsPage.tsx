import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Loader2, AlertCircle, Save, Pencil, Check, X } from 'lucide-react'
import { deviceConfigApi, myDeviceApi } from '@/api/devices'
import type { DeviceConfigDTO } from '@/types'
import { cn } from '@/lib/utils'

// ── Editable Field ────────────────────────────────────────────────────────────
function EditableNumber({
    label, value, unit, onSave, min, max, step = 1,
}: {
    label: string
    value: number
    unit?: string
    onSave: (v: number) => void
    min?: number
    max?: number
    step?: number
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(String(value))

    const handleSave = () => {
        const n = parseFloat(draft)
        if (!isNaN(n)) onSave(n)
        setEditing(false)
    }

    const handleCancel = () => {
        setDraft(String(value))
        setEditing(false)
    }

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-600 w-48 shrink-0">{label}</span>
            <div className="flex items-center gap-2">
                {editing ? (
                    <>
                        <input
                            autoFocus
                            type="number"
                            value={draft}
                            min={min}
                            max={max}
                            step={step}
                            onChange={(e) => setDraft(e.target.value)}
                            className="w-24 h-8 px-2 border border-[#639922] rounded-[6px] text-sm focus:outline-none font-mono text-right"
                        />
                        {unit && <span className="text-xs text-gray-400">{unit}</span>}
                        <button onClick={handleSave} className="p-1 text-[#639922] hover:text-[#4a7219]"><Check className="w-4 h-4" /></button>
                        <button onClick={handleCancel} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-semibold text-gray-800 font-mono">{value}{unit ? ` ${unit}` : ''}</span>
                        <button onClick={() => { setDraft(String(value)); setEditing(true) }}
                            className="p-1 text-gray-300 hover:text-[#639922] transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

function ToggleRow({ label, description, value, onToggle }: {
    label: string
    description?: string
    value: boolean
    onToggle: () => void
}) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
            <div>
                <p className="text-sm text-gray-700 font-medium">{label}</p>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={onToggle}
                className={cn(
                    'relative w-11 h-6 rounded-full transition-colors',
                    value ? 'bg-[#639922]' : 'bg-gray-200'
                )}
            >
                <span className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                    value ? 'translate-x-6' : 'translate-x-1'
                )} />
            </button>
        </div>
    )
}

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="px-6 py-3 bg-gray-50/60">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</span>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DeviceSettingsPage() {
    const { deviceId } = useParams<{ deviceId: string }>()
    const queryClient = useQueryClient()
    const [nameEditing, setNameEditing] = useState(false)
    const [nameDraft, setNameDraft] = useState('')
    const [saveSuccess, setSaveSuccess] = useState(false)

    const { data: config, isLoading, error } = useQuery({
        queryKey: ['device-config', deviceId],
        queryFn: () => deviceConfigApi.getConfig(deviceId!).then((r) => r.data.data),
        enabled: !!deviceId,
    })

    const { mutate: updateConfig, isPending: saving } = useMutation({
        mutationFn: (body: Partial<DeviceConfigDTO>) => deviceConfigApi.updateConfig(deviceId!, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['device-config', deviceId] })
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2000)
        },
    })

    const { mutate: updateName, isPending: nameSaving } = useMutation({
        mutationFn: (name: string) => myDeviceApi.updateName(deviceId!, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['device-config', deviceId] })
            setNameEditing(false)
        },
    })

    if (isLoading) return (
        <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
        </div>
    )

    if (error) return (
        <div className="flex items-center justify-center h-full gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" /> Không thể tải cấu hình
        </div>
    )

    if (!config) return null

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-[#639922]" />
                    <h1 className="text-xl font-semibold text-gray-900">Cấu hình thiết bị</h1>
                </div>
                <div className="flex items-center gap-2">
                    {saveSuccess && <span className="text-xs text-green-600 font-medium">✓ Đã lưu</span>}
                    {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 space-y-4 overflow-auto">

                {/* Device info */}
                <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm overflow-hidden">
                    <SectionTitle title="Thông tin thiết bị" />

                    {/* Name */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                        <span className="text-sm text-gray-600 w-48 shrink-0">Tên thiết bị</span>
                        <div className="flex items-center gap-2">
                            {nameEditing ? (
                                <>
                                    <input
                                        autoFocus
                                        value={nameDraft}
                                        onChange={(e) => setNameDraft(e.target.value)}
                                        className="h-8 px-2 border border-[#639922] rounded-[6px] text-sm focus:outline-none"
                                    />
                                    <button onClick={() => updateName(nameDraft)} disabled={nameSaving}
                                        className="p-1 text-[#639922] hover:text-[#4a7219]">
                                        {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => setNameEditing(false)} className="p-1 text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm font-semibold text-gray-800">{config.name}</span>
                                    <button onClick={() => { setNameDraft(config.name ?? ''); setNameEditing(true) }}
                                        className="p-1 text-gray-300 hover:text-[#639922] transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4">
                        <span className="text-sm text-gray-600 w-48 shrink-0">Trạng thái</span>
                        <span className={cn(
                            'text-xs font-semibold px-2.5 py-1 rounded-full',
                            config.status === 'online' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        )}>
                            {config.status}
                        </span>
                    </div>
                </div>

                {/* Auto watering */}
                <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm overflow-hidden">
                    <SectionTitle title="Tự động tưới" />
                    <ToggleRow
                        label="Bật tự động tưới"
                        description="Hệ thống tự tưới khi độ ẩm đất dưới ngưỡng thấp"
                        value={config.autoWaterEnabled ?? false}
                        onToggle={() => updateConfig({ autoWaterEnabled: !config.autoWaterEnabled })}
                    />
                    <EditableNumber
                        label="Ngưỡng độ ẩm thấp"
                        value={config.moistureThresholdLow ?? 0}
                        unit="%"
                        min={0} max={100}
                        onSave={(v) => updateConfig({ moistureThresholdLow: v })}
                    />
                    <EditableNumber
                        label="Ngưỡng độ ẩm cao"
                        value={config.moistureThresholdHigh ?? 0}
                        unit="%"
                        min={0} max={100}
                        onSave={(v) => updateConfig({ moistureThresholdHigh: v })}
                    />
                </div>

                {/* Calibration - readonly */}
                <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm overflow-hidden">
                    <SectionTitle title="Hiệu chỉnh cảm biến (user read only)" />
                    {[
                        { label: 'Độ ẩm đất', value: config.soilMoistureOffset ?? 0 },
                        { label: 'Nhiệt độ', value: config.airTemperatureOffset ?? 0, unit: '°C' },
                        { label: 'Độ ẩm không khí', value: config.airHumidityOffset ?? 0 },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-600">{item.label}</span>
                            <span className="text-sm font-mono text-gray-400">{item.value}{item.unit ?? ''}</span>
                        </div>
                    ))}
                </div>

                {/* Danger zone */}
                <div className="bg-white rounded-[12px] border border-red-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 bg-red-50/60">
                        <span className="text-xs font-semibold uppercase tracking-widest text-red-400">Vùng nguy hiểm</span>
                    </div>
                    <div className="px-6 py-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Huỷ claim thiết bị</p>
                            <p className="text-xs text-gray-400 mt-0.5">Gỡ thiết bị khỏi tài khoản của bạn</p>
                        </div>
                        <button
                            onClick={() => {
                                if (confirm('Bạn có chắc muốn huỷ claim thiết bị này?')) {
                                    myDeviceApi.unclaimDevice(deviceId!).then(() => {
                                        window.location.href = '/devices'
                                    })
                                }
                            }}
                            className="flex items-center gap-1.5 text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-[8px] transition-colors"
                        >
                            Huỷ claim
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}