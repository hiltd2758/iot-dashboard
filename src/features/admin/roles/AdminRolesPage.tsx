import { useEffect, useState } from 'react'
import { ShieldCheck, Plus, Loader2, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import api from '@/api/axios'
import type { RoleDTO, PermissionDTO } from '@/types'

// ── API ───────────────────────────────────────────────────────────────────────
const rolesApi = {
    getRoles: () => api.get<{ data: { content: RoleDTO[] } }>('/api/v1/admin/roles'),
    getPermissions: () => api.get<{ data: { content: PermissionDTO[] } }>('/api/v1/admin/roles/permissions'),
    createRole: (name: string, description?: string) =>
        api.post('/api/v1/admin/roles', { name, description }),
    createPermission: (name: string, description?: string) =>
        api.post('/api/v1/admin/roles/permissions', { name, description }),
    updateRolePermissions: (id: string, permissions: string[]) =>
        api.patch(`/api/v1/admin/roles/${id}/permissions`, { permissions }),
}

// ── Create Modal ──────────────────────────────────────────────────────────────
function CreateModal({
    title,
    onClose,
    onSubmit,
}: {
    title: string
    onClose: () => void
    onSubmit: (name: string, description: string) => Promise<void>
}) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) { setError('Vui lòng nhập tên'); return }
        setLoading(true)
        try {
            await onSubmit(name.trim(), description.trim())
            onClose()
        } catch {
            setError('Tạo thất bại, thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[16px] p-6 w-full max-w-sm shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        autoFocus
                        placeholder="Tên *"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError('') }}
                        className="w-full h-10 px-3 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922]"
                    />
                    <input
                        placeholder="Mô tả (tuỳ chọn)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-10 px-3 border border-gray-200 rounded-[8px] text-sm focus:outline-none focus:border-[#639922]"
                    />
                    {error && (
                        <p className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="w-3 h-3" /> {error}
                        </p>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 h-10 border border-gray-200 rounded-[8px] text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 h-10 bg-[#639922] hover:bg-[#4a7219] text-white rounded-[8px] text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Role Row ──────────────────────────────────────────────────────────────────
function RoleRow({ role, allPermissions, onUpdated }: {
    role: RoleDTO
    allPermissions: PermissionDTO[]
    onUpdated: () => void
}) {
    const [expanded, setExpanded] = useState(false)
    const [selected, setSelected] = useState<string[]>(role.permissions ?? [])
    const [saving, setSaving] = useState(false)

    const toggle = (name: string) =>
        setSelected((prev) => prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name])

    const handleSave = async () => {
        setSaving(true)
        try {
            await rolesApi.updateRolePermissions(role.id, selected)
            onUpdated()
        } catch { /* ignore */ } finally {
            setSaving(false)
        }
    }

    const changed = JSON.stringify([...selected].sort()) !== JSON.stringify([...(role.permissions ?? [])].sort())

    return (
        <div className="border-b border-gray-50 last:border-0">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-[#639922]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{role.name}</p>
                        <p className="text-xs text-gray-400">{(role.permissions ?? []).length} quyền</p>
                    </div>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {expanded && (
                <div className="px-6 pb-5">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {allPermissions.map((p) => {
                            const active = selected.includes(p.name)
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => toggle(p.name)}
                                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${active
                                        ? 'bg-[#639922] text-white border-[#639922]'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#639922] hover:text-[#639922]'
                                        }`}
                                >
                                    {p.name}
                                </button>
                            )
                        })}
                    </div>
                    {changed && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 text-xs font-medium bg-[#639922] hover:bg-[#4a7219] text-white px-4 py-2 rounded-[8px] transition-colors disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminRolesPage() {
    const [roles, setRoles] = useState<RoleDTO[]>([])
    const [permissions, setPermissions] = useState<PermissionDTO[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [modal, setModal] = useState<'role' | 'permission' | null>(null)

    const fetchAll = async () => {
        setLoading(true)
        setError(null)
        try {
            const [rolesRes, permsRes] = await Promise.all([
                rolesApi.getRoles(),
                rolesApi.getPermissions(),
            ])
            setRoles(rolesRes.data.data.content)

            setPermissions(permsRes.data.data.content)
        } catch {
            setError('Không thể tải dữ liệu phân quyền.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    return (
        <div className="flex-1 p-6 overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">Phân quyền</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{roles.length} roles · {permissions.length} permissions</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setModal('permission')}
                            className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-[8px] transition-colors text-gray-700"
                        >
                            <Plus className="w-4 h-4" /> Permission
                        </button>
                        <button
                            onClick={() => setModal('role')}
                            className="flex items-center gap-1.5 text-sm font-medium bg-[#639922] hover:bg-[#4a7219] text-white px-4 py-2 rounded-[8px] transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Role
                        </button>
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

                {/* Roles list */}
                {!loading && roles.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {roles.map((role) => (
                            <RoleRow
                                key={role.id}
                                role={role}
                                allPermissions={permissions}
                                onUpdated={fetchAll}
                            />
                        ))}
                    </div>
                )}

                {!loading && roles.length === 0 && !error && (
                    <div className="text-center py-16 text-gray-400 text-sm">Chưa có role nào.</div>
                )}

                {/* Permissions list */}
                {!loading && permissions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                            Tất cả Permissions
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {permissions.map((p) => (
                                <span key={p.id} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {modal === 'role' && (
                <CreateModal
                    title="Tạo Role mới"
                    onClose={() => setModal(null)}
                    onSubmit={async (name, desc) => {
                        console.log('creating permission:', name, desc)
                        await rolesApi.createPermission(name, desc)
                        fetchAll()
                    }}
                />
            )}
            {modal === 'permission' && (
                <CreateModal
                    title="Tạo Permission mới"
                    onClose={() => setModal(null)}
                    onSubmit={(name, desc) => rolesApi.createPermission(name, desc).then(fetchAll)}
                />
            )}
        </div>
    )
}