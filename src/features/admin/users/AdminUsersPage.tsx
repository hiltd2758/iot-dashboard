import { useEffect, useState } from 'react'
import { Users, Loader2, AlertCircle, ChevronLeft, ChevronRight, Trash2, ShieldCheck, KeyRound, X } from 'lucide-react'
import api from '@/api/axios'
import type { UserProfileDTO } from '@/types'

// ── API ───────────────────────────────────────────────────────────────────────
const usersApi = {
  getAll: (page = 0, size = 10) =>
    api.get<{ data: { content: UserProfileDTO[]; totalPages: number; totalElements: number } }>(
      '/api/v1/admin/users', { params: { page, size } }
    ),
  updateRoles: (id: string, roles: string[]) =>
    api.patch(`/api/v1/admin/users/${id}/roles`, { roles }),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/api/v1/admin/users/${id}/reset-password`, { newPassword }),
  deleteUser: (id: string) =>
    api.delete(`/api/v1/admin/users/${id}`),
}

// ── Update Roles Modal ────────────────────────────────────────────────────────
function UpdateRolesModal({ user, onClose, onSaved }: {
  user: UserProfileDTO
  onClose: () => void
  onSaved: () => void
}) {
  const ALL_ROLES = ['USER', 'ADMIN']
  const [selected, setSelected] = useState<string[]>(user.roles ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggle = (role: string) =>
    setSelected((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role])

  const handleSave = async () => {
    setSaving(true)
    try {
      await usersApi.updateRoles(user.id, selected)
      onSaved()
      onClose()
    } catch {
      setError('Cập nhật thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Cập nhật Role</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-gray-500 mb-4">{user.name} ({user.username})</p>
        <div className="flex gap-2 mb-5">
          {ALL_ROLES.map((role) => (
            <button key={role} onClick={() => toggle(role)}
              className={`text-xs px-4 py-2 rounded-full font-medium border transition-colors ${
                selected.includes(role)
                  ? 'bg-[#639922] text-white border-[#639922]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#639922]'
              }`}>
              {role}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-10 border border-gray-200 rounded-[8px] text-sm text-gray-600 hover:bg-gray-50">
            Hủy
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 bg-[#639922] hover:bg-[#4a7219] text-white rounded-[8px] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Lưu
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }: { user: UserProfileDTO; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự'); return }
    setSaving(true)
    try {
      await usersApi.resetPassword(user.id, password)
      setSuccess(true)
    } catch {
      setError('Reset thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Reset mật khẩu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {success ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium text-sm">✓ Reset thành công</p>
            <button onClick={onClose} className="mt-4 text-xs text-gray-400 hover:text-gray-600">Đóng</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-gray-500">{user.name} ({user.username})</p>
            <input
              type="password"
              placeholder="Mật khẩu mới *"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="w-full h-10 px-3 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922]"
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 h-10 border border-gray-200 rounded-[8px] text-sm text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 h-10 bg-[#639922] hover:bg-[#4a7219] text-white rounded-[8px] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfileDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [rolesModal, setRolesModal] = useState<UserProfileDTO | null>(null)
  const [resetModal, setResetModal] = useState<UserProfileDTO | null>(null)

  const fetchUsers = async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await usersApi.getAll(p)
      setUsers(res.data.data.content)
      setTotalPages(res.data.data.totalPages)
      setTotalElements(res.data.data.totalElements)
    } catch {
      setError('Không thể tải danh sách người dùng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers(page) }, [page])

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa người dùng này?')) return
    try {
      await usersApi.deleteUser(id)
      fetchUsers(page)
    } catch {
      alert('Xóa thất bại.')
    }
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[#639922]" />
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Người dùng</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalElements > 0 ? `${totalElements} người dùng` : 'Chưa có người dùng'}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        )}

        {/* Table */}
        {!loading && users.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  <th className="text-left px-5 py-3.5">Người dùng</th>
                  <th className="text-left px-5 py-3.5">Email</th>
                  <th className="text-left px-5 py-3.5">Roles</th>
                  <th className="text-left px-5 py-3.5">Ngày tạo</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#639922] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {u.name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {(u.roles ?? []).map((r) => (
                          <span key={r} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            r === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                          }`}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setRolesModal(u)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-[#639922] hover:bg-green-50 transition-colors" title="Cập nhật role">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => setResetModal(u)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Reset mật khẩu">
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
                <span>Trang {page + 1} / {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && users.length === 0 && !error && (
          <div className="text-center py-16 text-gray-400 text-sm">Không có người dùng nào.</div>
        )}
      </div>

      {rolesModal && (
        <UpdateRolesModal user={rolesModal} onClose={() => setRolesModal(null)} onSaved={() => fetchUsers(page)} />
      )}
      {resetModal && (
        <ResetPasswordModal user={resetModal} onClose={() => setResetModal(null)} />
      )}
    </div>
  )
}