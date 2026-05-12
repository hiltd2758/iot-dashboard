import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import VerifyPage from '@/features/auth/VerifyPage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import DevicesPage from '@/features/devices/DevicesPage'
import DeviceDashboard from '@/features/dashboard/DeviceDashboard'

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
              <Route path="/devices/:deviceId/logs" element={<div className="p-8 text-gray-500">Nhật ký — coming soon</div>} />
              <Route path="/devices/:deviceId/notifications" element={<div className="p-8 text-gray-500">Thông báo — coming soon</div>} />
              <Route path="/devices/:deviceId/settings" element={<div className="p-8 text-gray-500">Cấu hình — coming soon</div>} />

              {/* ADMIN routes */}
              <Route path="/admin/devices" element={<div className="p-8 text-gray-500">Admin Devices — coming soon</div>} />
              <Route path="/admin/users" element={<div className="p-8 text-gray-500">Admin Users — coming soon</div>} />
              <Route path="/admin/roles" element={<div className="p-8 text-gray-500">Admin Roles — coming soon</div>} />
              <Route path="/admin/config" element={<div className="p-8 text-gray-500">Admin Config — coming soon</div>} />
              <Route path="/admin/audit-log" element={<div className="p-8 text-gray-500">Audit Log — coming soon</div>} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="*" element={<Navigate to="/devices" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}