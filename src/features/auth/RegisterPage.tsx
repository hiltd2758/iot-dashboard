import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Droplets, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'

const RULES = {
  username: {
    pattern: /^[a-z0-9]+[a-z0-9_]{3,15}$/,
    message: 'Chỉ chữ thường, số, gạch dưới. Tối thiểu 4, tối đa 16 ký tự',
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    message: 'Tối thiểu 8 ký tự, gồm hoa, thường, số và @$!%*?&',
  },
  email: {
    pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
    message: 'Email không hợp lệ',
  },
}

const INIT_FORM = { username: '', email: '', name: '', password: '', confirmPassword: '' }

function validate(form: typeof INIT_FORM) {
  const errors: Partial<typeof INIT_FORM> = {}
  if (!form.username) errors.username = 'Không được để trống'
  else if (!RULES.username.pattern.test(form.username)) errors.username = RULES.username.message
  if (!form.name) errors.name = 'Không được để trống'
  if (!form.email) errors.email = 'Không được để trống'
  else if (!RULES.email.pattern.test(form.email)) errors.email = RULES.email.message
  if (!form.password) errors.password = 'Không được để trống'
  else if (!RULES.password.pattern.test(form.password)) errors.password = RULES.password.message
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
  return errors
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  )
}

// ─── Step 2: Verify token form ────────────────────────────────────────────────
function VerifyTokenStep({ username, onSuccess }: { username: string; onSuccess: () => void }) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) { setError('Vui lòng nhập token'); return }
    setLoading(true)
    setError('')
    try {
      await authApi.verifyUser(token.trim())
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Token không hợp lệ hoặc đã hết hạn')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendMsg('')
    try {
      await authApi.refreshUserVerification(username)
      setResendMsg('Đã tạo token mới — kiểm tra log backend')
    } catch {
      setResendMsg('Gửi lại thất bại')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl w-full max-w-md">
      <div className="flex flex-col items-center mb-7">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
          <KeyRound className="w-7 h-7 text-teal-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Xác minh tài khoản</h2>
        <p className="text-slate-400 text-sm mt-1 text-center">
          Copy token từ <span className="text-amber-400 font-mono text-xs">log backend</span> và dán vào bên dưới
        </p>
      </div>

      {/* Hướng dẫn */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-5 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">Cách lấy token:</p>
        <p>1. Mở terminal đang chạy backend</p>
        <p>2. Tìm dòng: <span className="font-mono text-teal-400">Assign new token {'<token>'} for user...</span></p>
        <p>3. Copy token UUID và dán vào ô bên dưới</p>
        <p className="text-amber-400">⚠ Token hết hạn sau <strong>5 phút</strong></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <Label className="text-slate-300 text-sm">Token xác minh</Label>
          <Input
            value={token}
            onChange={(e) => { setToken(e.target.value); setError('') }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 focus:border-teal-500 h-10 mt-1 font-mono text-sm"
          />
          {error && (
            <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
              <AlertCircle className="w-3 h-3" /> {error}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading}
          className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xác minh...</> : 'Xác minh'}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={handleResend} disabled={resending}
          className="text-slate-400 hover:text-slate-200 text-sm transition-colors disabled:opacity-50">
          {resending ? 'Đang tạo token mới...' : 'Tạo token mới'}
        </button>
        {resendMsg && <p className="text-xs text-teal-400 mt-1">{resendMsg}</p>}
      </div>
    </div>
  )
}

// ─── Step 3: Success ──────────────────────────────────────────────────────────
function SuccessStep() {
  const navigate = useNavigate()
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl w-full max-w-md text-center">
      <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-teal-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Xác minh thành công!</h2>
      <p className="text-slate-400 text-sm mb-6">Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay.</p>
      <Button onClick={() => navigate('/login')}
        className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold w-full">
        Đăng nhập ngay
      </Button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [form, setForm] = useState(INIT_FORM)
  const [errors, setErrors] = useState<Partial<typeof INIT_FORM>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'register' | 'verify' | 'done'>('register')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setApiError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await authApi.signUp({ username: form.username, email: form.email, name: form.name, password: form.password })
      setStep('verify')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Đăng ký thất bại'
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative w-full max-w-md">

        {step === 'verify' && <VerifyTokenStep username={form.username} onSuccess={() => setStep('done')} />}
        {step === 'done' && <SuccessStep />}

        {step === 'register' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
                <Droplets className="w-7 h-7 text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Tạo tài khoản</h1>
              <p className="text-slate-400 text-sm mt-1">IoT Irrigation System</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="username" className="text-slate-300 text-sm">Tên đăng nhập</Label>
                  <Input id="username" name="username" placeholder="vd: user_01"
                    value={form.username} onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 h-10 mt-1" />
                  <FieldError msg={errors.username} />
                </div>
                <div>
                  <Label htmlFor="name" className="text-slate-300 text-sm">Họ và tên</Label>
                  <Input id="name" name="name" placeholder="Nguyễn Văn A"
                    value={form.name} onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 h-10 mt-1" />
                  <FieldError msg={errors.name} />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-300 text-sm">Email</Label>
                <Input id="email" name="email" type="email" placeholder="example@email.com"
                  value={form.email} onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 h-10 mt-1" />
                <FieldError msg={errors.email} />
              </div>

              <div>
                <Label htmlFor="password" className="text-slate-300 text-sm">Mật khẩu</Label>
                <div className="relative mt-1">
                  <Input id="password" name="password"
                    type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={handleChange}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 h-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError msg={errors.password} />
                {!errors.password && <p className="text-xs text-slate-500 mt-1">Tối thiểu 8 ký tự, gồm hoa, thường, số và @$!%*?&</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-slate-300 text-sm">Xác nhận mật khẩu</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••"
                  value={form.confirmPassword} onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 h-10 mt-1" />
                <FieldError msg={errors.confirmPassword} />
              </div>

              {apiError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {apiError}
                </div>
              )}

              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang đăng ký...</> : 'Đăng ký'}
              </Button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-5">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Đăng nhập</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}