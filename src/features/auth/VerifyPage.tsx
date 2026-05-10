import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Droplets, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function VerifyPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token không hợp lệ')
      return
    }
    authApi
      .verifyUser(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Xác minh thất bại')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-6">
          <Droplets className="w-7 h-7 text-teal-400" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white">Đang xác minh tài khoản...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Xác minh thành công!</h2>
            <p className="text-slate-400 text-sm mb-6">Tài khoản của bạn đã được kích hoạt.</p>
            <Button
              onClick={() => navigate('/login')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold"
            >
              Đăng nhập ngay
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Xác minh thất bại</h2>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Về trang đăng nhập
            </Button>
          </>
        )}
      </div>
    </div>
  )
}