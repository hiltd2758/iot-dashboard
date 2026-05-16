import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Droplets, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const navigate = useNavigate()
    const setTokens = useAuthStore((s) => s.setTokens)
    const setUser = useAuthStore((s) => s.setUser)

    const [form, setForm] = useState({ username: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.username || !form.password) {
            setError('Vui lòng nhập đầy đủ thông tin')
            return
        }
        setLoading(true)
        try {
            const res = await authApi.login(form)
            console.log('login response:', res.data)

            const { token, refreshToken, id, username, email, name, roles } = res.data.data
            setTokens(token, refreshToken)
            setUser({ id, username, email, name, roles, createdAt: '' })
            const isAdmin = roles?.includes('ADMIN') ?? false
            navigate(isAdmin ? '/admin/devices' : '/devices')
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Đăng nhập thất bại. Kiểm tra lại thông tin.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
                            <Droplets className="w-7 h-7 text-teal-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">IoT Irrigation</h1>
                        <p className="text-slate-400 text-sm mt-1">Hệ thống tưới tiêu thông minh</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-300 text-sm">
                                Tên đăng nhập
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="username"
                                value={form.username}
                                onChange={handleChange}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 h-11"
                                autoComplete="username"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 text-sm">
                                Mật khẩu
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 h-11 pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold transition-all duration-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-slate-500 text-sm mt-6">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>

                {/* Version badge */}
                <p className="text-center text-slate-600 text-xs mt-4">IoT Irrigation Dashboard v1.0</p>
            </div>
        </div>
    )
}