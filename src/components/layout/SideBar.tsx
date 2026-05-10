import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import {
  LayoutDashboard,
  Sprout,
  Wind,
  Droplets,
  CalendarClock,
  ScrollText,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    label: 'TỔNG QUAN',
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'CẢM BIẾN',
    items: [
      { to: '/sensors/soil', icon: Sprout, label: 'Độ ẩm đất' },
      { to: '/sensors/air', icon: Wind, label: 'Không khí' },
    ],
  },
  {
    label: 'ĐIỀU KHIỂN',
    items: [
      { to: '/control/watering', icon: Droplets, label: 'Tưới nước' },
      { to: '/control/schedule', icon: CalendarClock, label: 'Lịch tưới' },
      { to: '/control/logs', icon: ScrollText, label: 'Nhật ký' },
    ],
  },
  {
    label: 'HỆ THỐNG',
    items: [
      { to: '/notifications', icon: Bell, label: 'Thông báo' },
      { to: '/settings', icon: Settings, label: 'Cấu hình' },
    ],
  },
]

interface SidebarProps {
  unreadCount?: number
}

export default function Sidebar({ unreadCount = 0 }: SidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    }
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="flex flex-col w-[248px] min-h-screen shrink-0"
      style={{ background: 'var(--green-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--green-main)' }}>
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">AquaIoT</div>
          <div className="text-white/50 text-xs">Smart Watering</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-white/40 text-[10px] font-semibold tracking-widest px-2 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/65 hover:bg-white/8 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {label === 'Thông báo' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ background: 'var(--green-main)' }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name ?? 'User'}</div>
            <div className="text-white/50 text-xs truncate">{user?.roles?.[0] ?? 'Operator'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/50 hover:text-white transition-colors p-1 rounded"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}