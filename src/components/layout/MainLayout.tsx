import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import UserSidebar from './UserSidebar'
import AdminSidebar from './AdminSidebar'

export default function MainLayout() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.roles?.includes('ADMIN') ?? false

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {isAdmin ? <AdminSidebar /> : <UserSidebar />}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}