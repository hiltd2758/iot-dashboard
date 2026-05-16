import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { userApi } from '@/api/user'
import type { UserProfileDTO } from '@/types'
import {
  User, Mail, Shield, CalendarDays, AtSign,
  Loader2, AlertCircle, ArrowLeft, RefreshCw,
} from 'lucide-react'

export default function ProfilePage() {
  const { user: storeUser, setUser } = useAuthStore()
  const [profile, setProfile] = useState<UserProfileDTO | null>(storeUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storeUser?.username) return
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await userApi.getProfile(storeUser.username)
        const data = res.data.data
        setProfile(data)
        setUser(data)
      } catch {
        setError('Không thể tải thông tin người dùng.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [storeUser?.username])

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  }

  const avatar = profile?.name?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-main)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-[var(--radius-sm)] border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Quay về"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Trang cá nhân
          </h1>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-[var(--radius-sm)] border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-auto scrollbar-thin space-y-4">

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm py-16" style={{ color: 'var(--text-secondary)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-5 py-3.5 rounded-[var(--radius)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && profile && (
          <>
            {/* Avatar card */}
            <div className="bg-white rounded-[var(--radius)] shadow-sm border border-gray-100 p-6 flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-[var(--radius)] flex items-center justify-center text-white text-2xl font-bold shrink-0 font-mono-data"
                style={{ background: 'var(--green-main)' }}
              >
                {avatar}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {profile.name}
                </div>
                <div className="text-sm mt-0.5 font-mono-data" style={{ color: 'var(--text-secondary)' }}>
                  @{profile.username}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {profile.roles?.map((role) => (
                    <span
                      key={role}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white tracking-wide"
                      style={{ background: 'var(--green-main)' }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Info fields */}
            <div className="bg-white rounded-[var(--radius)] shadow-sm border border-gray-100 divide-y divide-gray-50">
              <InfoRow icon={<User className="w-4 h-4" />}      label="Họ và tên"     value={profile.name} />
              <InfoRow icon={<AtSign className="w-4 h-4" />}    label="Tên đăng nhập" value={profile.username} mono />
              <InfoRow icon={<Mail className="w-4 h-4" />}      label="Email"          value={profile.email} mono />
              <InfoRow
                icon={<Shield className="w-4 h-4" />}
                label="Vai trò"
                value={profile.roles?.join(', ') ?? '—'}
              />
              <InfoRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Ngày tạo"
                value={formatDate(profile.createdAt as unknown as string)}
                mono
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function InfoRow({
  icon, label, value, mono = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <span className="shrink-0 text-gray-300">{icon}</span>
      <span className="text-sm w-36 shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span
        className={`text-sm font-medium truncate ${mono ? 'font-mono-data' : ''}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </span>
    </div>
  )
}