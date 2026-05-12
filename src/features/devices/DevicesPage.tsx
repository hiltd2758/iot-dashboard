import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { myDeviceApi } from '@/api/devices'
import { Plus, Cpu, Wifi, WifiOff, Loader2, X, AlertCircle, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { DeviceDTO } from '@/types'

// ── Device Card ───────────────────────────────────────────────────────────────
function DeviceCard({ device, onClick, onUnclaim }: {
  device: DeviceDTO
  onClick: () => void
  onUnclaim: () => void
}) {
  const [menu, setMenu] = useState(false)
  const isOnline = device.status === 'online' || device.status === 'ONLINE'

  return (
    <div className="relative bg-white rounded-[12px] p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#639922]/30 transition-all group">
      <div className="absolute top-3 right-3">
        <button onClick={(e) => { e.stopPropagation(); setMenu((v) => !v) }}
          className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4" />
        </button>
        {menu && (
          <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-[8px] shadow-lg py-1 z-10 min-w-[140px]">
            <button onClick={(e) => { e.stopPropagation(); setMenu(false); onUnclaim() }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
              <Trash2 className="w-3.5 h-3.5" /> Huỷ claim
            </button>
          </div>
        )}
      </div>

      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: isOnline ? 'rgba(99,153,34,0.1)' : 'rgba(0,0,0,0.05)' }}>
            <Cpu className="w-5 h-5" style={{ color: isOnline ? 'var(--green-main)' : '#9ca3af' }} />
          </div>
          <div className={cn('flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
            isOnline ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400')}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <div className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-[#639922] transition-colors">
          {device.name}
        </div>
        <div className="text-xs text-gray-400 font-mono mb-1">{device.chipId ?? device.id.slice(0, 8)}</div>
        {device.autoWaterEnabled && (
          <div className="mt-2 text-xs text-teal-600 bg-teal-50 rounded-md px-2 py-1 inline-block">
            Auto tưới bật
          </div>
        )}
      </button>
    </div>
  )
}

// ── Claim Modal ───────────────────────────────────────────────────────────────
function ClaimDeviceModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [chipId, setChipId] = useState('')
  const [error, setError] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => myDeviceApi.claimDevice(chipId.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-devices'] })
      onClose()
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Claim thất bại. Kiểm tra lại Chip ID.')
    },
  })

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Thêm thiết bị</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-[8px] px-4 py-3 mb-4 text-xs text-amber-700 space-y-1">
          <p className="font-semibold">Cách lấy Chip ID:</p>
          <p>ESP32 tự publish lên MQTT topic <span className="font-mono bg-amber-100 px-1 rounded">device/register</span> khi boot.</p>
          <p>Chip ID có dạng: <span className="font-mono bg-amber-100 px-1 rounded">FBDF21-321</span></p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (!chipId.trim()) { setError('Vui lòng nhập Chip ID'); return } setError(''); mutate() }}
          className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700">Chip ID</Label>
            <Input value={chipId} onChange={(e) => { setChipId(e.target.value); setError('') }}
              placeholder="FBDF21-321"
              className="mt-1 h-10 border-gray-200 focus:border-[#639922] font-mono text-sm" autoFocus />
            {error && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 border-gray-200">Hủy</Button>
            <Button type="submit" disabled={isPending} className="flex-1 h-10 bg-[#639922] hover:bg-[#4a7219] text-white">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DevicesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showClaim, setShowClaim] = useState(false)

  const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ['my-devices'],
    queryFn: () => myDeviceApi.getMyDevices().then((r) => r.data.data),
  })

  const { mutate: unclaim } = useMutation({
    mutationFn: (deviceId: string) => myDeviceApi.unclaimDevice(deviceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-devices'] }),
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Thiết bị của tôi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Chọn thiết bị để xem dashboard</p>
        </div>
        <Button onClick={() => setShowClaim(true)}
          className="bg-[#639922] hover:bg-[#4a7219] text-white h-9 px-4 text-sm gap-2">
          <Plus className="w-4 h-4" /> Thêm thiết bị
        </Button>
      </div>

      <div className="flex-1 p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-[#639922]" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-400 text-sm gap-2">
            <AlertCircle className="w-4 h-4" /> Không thể tải danh sách thiết bị
          </div>
        ) : devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Cpu className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Chưa có thiết bị nào</h3>
            <p className="text-sm text-gray-400 mb-5">Bật nguồn ESP32, đợi kết nối MQTT rồi claim bằng Chip ID</p>
            <Button onClick={() => setShowClaim(true)} className="bg-[#639922] hover:bg-[#4a7219] text-white gap-2">
              <Plus className="w-4 h-4" /> Claim thiết bị đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device}
                onClick={() => navigate(`/devices/${device.id}`)}
                onUnclaim={() => unclaim(device.id)} />
            ))}
          </div>
        )}
      </div>

      {showClaim && <ClaimDeviceModal onClose={() => setShowClaim(false)} />}
    </div>
  )
}