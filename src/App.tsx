import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '@/features/auth/LoginPage'
import RegisterPage from '@/features/auth/RegisterPage'
import VerifyPage from '@/features/auth/VerifyPage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
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
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Các route khác sẽ thêm sau */}
              <Route path="/sensors/soil" element={<div className="p-8 text-gray-500">Độ ẩm đất — coming soon</div>} />
              <Route path="/sensors/air" element={<div className="p-8 text-gray-500">Không khí — coming soon</div>} />
              <Route path="/control/watering" element={<div className="p-8 text-gray-500">Tưới nước — coming soon</div>} />
              <Route path="/control/schedule" element={<div className="p-8 text-gray-500">Lịch tưới — coming soon</div>} />
              <Route path="/control/logs" element={<div className="p-8 text-gray-500">Nhật ký — coming soon</div>} />
              <Route path="/notifications" element={<div className="p-8 text-gray-500">Thông báo — coming soon</div>} />
              <Route path="/settings" element={<div className="p-8 text-gray-500">Cấu hình — coming soon</div>} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}