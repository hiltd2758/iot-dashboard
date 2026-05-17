import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import {
  LayoutDashboard, Droplets, CalendarClock, ScrollText, Bell, Settings, LogOut, Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserSidebarProps {
  unreadCount?: number
}

export default function UserSidebar({ unreadCount = 0 }: UserSidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { deviceId } = useParams()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) { try { await authApi.logout(refreshToken) } catch { /* ignore */ } }
    logout()
    navigate('/login')
  }

  const NAV = deviceId ? [
    { to: `/devices/${deviceId}`, icon: LayoutDashboard, label: 'Dashboard' },
    // { to: `/devices/${deviceId}/watering`, icon: Droplets, label: 'Tưới nước' },
    { to: `/devices/${deviceId}/schedule`, icon: CalendarClock, label: 'Lịch tưới' },
    { to: `/devices/${deviceId}/logs`, icon: ScrollText, label: 'Nhật ký' },
    // { to: `/devices/${deviceId}/notifications`, icon: Bell, label: 'Thông báo', badge: unreadCount },
    { to: `/devices/${deviceId}/notifications`, icon: Bell, label: 'Thông báo' },
    { to: `/devices/${deviceId}/settings`, icon: Settings, label: 'Cấu hình' },
  ] : []

  return (
    <aside className="flex flex-col w-[248px] min-h-screen shrink-0" style={{ background: 'var(--green-sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 cursor-pointer"
        onClick={() => navigate('/devices')}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--green-main)' }}>
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">Nhóm Yêu Nước - IoT</div>
          <div className="text-white/50 text-xs">Smart Watering</div>
        </div>
      </div>

      {/* Back to devices */}
      {deviceId && (
        <div className="px-3 pt-3">
          <button onClick={() => navigate('/devices')}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-[8px] text-white/50 hover:text-white hover:bg-white/8 text-xs transition-colors">
            <Cpu className="w-3.5 h-3.5" />
            Thiết bị của tôi
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {deviceId ? (
          <>
            <p className="text-white/40 text-[10px] font-semibold tracking-widest px-2 mb-2 mt-2">THIẾT BỊ</p>
            {NAV.map(({ to, icon: Icon, label, badge }) => (
              <NavLink key={to} to={to} end
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all',
                  isActive ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'
                )}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </NavLink>
            ))}
          </>
        ) : (
          <div className="px-2 pt-4 text-white/30 text-xs">Chọn thiết bị để bắt đầu</div>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          {/* ↓ CHỈ SỬA TỪ ĐÂY: bọc avatar+name vào button */}
          <button onClick={() => navigate('/profile')}
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
              style={{ background: 'var(--green-main)' }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name ?? 'User'}</div>
              <div className="text-white/50 text-xs truncate">{user?.roles?.[0] ?? 'User'}</div>
            </div>
          </button>
          {/* ↑ ĐẾN ĐÂY */}
          <button onClick={handleLogout} className="text-white/50 hover:text-white transition-colors p-1 rounded" title="Đăng xuất">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}