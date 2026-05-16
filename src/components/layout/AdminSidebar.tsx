import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth'
import { Cpu, Users, ShieldCheck, Settings, ScrollText, Droplets, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin/devices', icon: Cpu, label: 'Thiết bị' },
  { to: '/admin/users', icon: Users, label: 'Người dùng' },
  { to: '/admin/roles', icon: ShieldCheck, label: 'Phân quyền' },
  { to: '/admin/config', icon: Settings, label: 'Cấu hình hệ thống' },
  { to: '/admin/audit-log', icon: ScrollText, label: 'Audit Log' },
]

export default function AdminSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) { try { await authApi.logout(refreshToken) } catch { /* ignore */ } }
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex flex-col w-[248px] min-h-screen shrink-0" style={{ background: 'var(--green-sidebar)' }}>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--green-main)' }}>
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">AquaIoT</div>
          <div className="text-white/50 text-xs">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/40 text-[10px] font-semibold tracking-widest px-2 mb-2">QUẢN TRỊ</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all',
              isActive ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'
            )}>
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

     <div className="px-3 py-4 border-t border-white/10">
  <div className="flex items-center gap-3 px-2 py-2">
    {/* Avatar + name clickable */}
    <button
      onClick={() => navigate('/profile')}
      className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
        style={{ background: 'var(--green-main)' }}
      >
        {user?.name?.[0]?.toUpperCase() ?? 'A'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">
          {user?.name ?? 'Admin'}
        </div>
        <div className="text-white/50 text-xs">Administrator</div>
      </div>
    </button>

    {/* Logout giữ nguyên */}
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