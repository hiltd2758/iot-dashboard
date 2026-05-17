import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import VerifyPage from '@/features/auth/VerifyPage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import DevicesPage from '@/features/devices/DevicesPage'
import DeviceDashboard from '@/features/dashboard/DeviceDashboard'
import ProfilePage from '@/features/profile/ProfilePage'
import AdminDevicesPage from '@/features/admin/devices/AdminDevicesPage'
import AdminDeviceDetailPage from '@/features/admin/devices/AdminDeviceDetailPage'
import NotificationsPage from '@/features/notifications/NotificationsPage'
import AdminRolesPage from '@/features/admin/roles/AdminRolesPage'

import AdminConfigPage from './features/admin/config/AdminConfigPage '
import AdminUsersPage from '@/features/admin/users/AdminUsersPage'
import AdminAuditLogPage from '@/features/admin/audit-log/AdminAuditLogPage'
import WateringLogsPage from './features/logs/WateringLogsPage'
import DeviceSettingsPage from '@/features/settings/DeviceSettingsPage'


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:token" element={<VerifyPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* USER routes */}
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/devices/:deviceId" element={<DeviceDashboard />} />
              <Route path="/devices/:deviceId/watering" element={<div className="p-8 text-gray-500">Tưới nước — coming soon</div>} />
              <Route path="/devices/:deviceId/schedule" element={<div className="p-8 text-gray-500">Lịch tưới — coming soon</div>} />
              <Route path="/devices/:deviceId/logs" element={<WateringLogsPage />} />
              <Route path="/devices/:deviceId/notifications" element={<NotificationsPage />} />
              <Route path="/devices/:deviceId/settings" element={<DeviceSettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* ADMIN routes */}
              <Route path="/admin/devices" element={<AdminDevicesPage />} />
              <Route path="/admin/devices/:id" element={<AdminDeviceDetailPage />} />

              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/roles" element={<AdminRolesPage />} />
              <Route path="/admin/config" element={<AdminConfigPage />} />
              <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="*" element={<Navigate to="/devices" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}