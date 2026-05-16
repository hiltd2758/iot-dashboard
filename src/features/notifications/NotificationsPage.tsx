import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '@/api/notifications'
import { Bell, Trash2, CheckCheck, Loader2, AlertCircle, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationDTO } from '@/types'

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Vừa xong'
    if (m < 60) return `${m} phút trước`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} giờ trước`
    return `${Math.floor(h / 24)} ngày trước`
}

function typeBadge(type: string) {
    const map: Record<string, { label: string; className: string }> = {
        ALERT: { label: 'Cảnh báo', className: 'bg-red-50 text-red-500' },
        INFO: { label: 'Thông tin', className: 'bg-blue-50 text-blue-500' },
        WARNING: { label: 'Lưu ý', className: 'bg-amber-50 text-amber-500' },
    }
    return map[type] ?? { label: type, className: 'bg-gray-100 text-gray-500' }
}

function NotificationItem({
    notification,
    onRead,
    onDelete,
}: {
    notification: NotificationDTO
    onRead: (id: string) => void
    onDelete: (id: string) => void
}) {
    const badge = typeBadge(notification.type)

    return (
        <div
            className={cn(
                'flex items-start gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group',
                !notification.isRead && 'bg-green-50/40',
            )}
        >
            {/* Unread dot */}
            <div className="mt-1.5 shrink-0">
                <div
                    className={cn(
                        'w-2 h-2 rounded-full',
                        notification.isRead ? 'bg-transparent' : 'bg-[#639922]',
                    )}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', badge.className)}>
                        {badge.label}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notification.message}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                {!notification.isRead && (
                    <button
                        onClick={() => onRead(notification.id)}
                        className="p-1.5 rounded-lg hover:bg-green-100 text-gray-400 hover:text-[#639922] transition-colors"
                        title="Đánh dấu đã đọc"
                    >
                        <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(notification.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Xóa"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}

export default function NotificationsPage() {
    const { deviceId } = useParams<{ deviceId: string }>()
    const queryClient = useQueryClient()
    const [page, setPage] = useState(0)

    const { data, isLoading, error } = useQuery({
        queryKey: ['notifications', deviceId, page],
        queryFn: () => notificationApi.getNotifications(page, 15).then((r) => r.data.data),
        enabled: !!deviceId,
    })

    const { data: unreadData } = useQuery({
        queryKey: ['notifications-unread', deviceId],
        queryFn: () => notificationApi.getUnreadCount().then((r) => r.data.data),
        enabled: !!deviceId,
        refetchInterval: 30_000,
    })

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['notifications', deviceId] })
        queryClient.invalidateQueries({ queryKey: ['notifications-unread', deviceId] })
    }

    const { mutate: markRead } = useMutation({
        mutationFn: (id: string) => notificationApi.markAsRead(id),
        onSuccess: invalidate,
    })

    const { mutate: markAll, isPending: markingAll } = useMutation({
        mutationFn: () => notificationApi.markAllAsRead(),
        onSuccess: invalidate,
    })

    const { mutate: deleteOne } = useMutation({
        mutationFn: (id: string) => notificationApi.deleteNotification(id),
        onSuccess: invalidate,
    })

    const notifications: NotificationDTO[] = data?.content ?? []
    const totalPages = data?.totalPages ?? 1
    const unread = unreadData?.unreadCount ?? 0

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#639922]" />
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Thông báo</h1>
                        {unread > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{unread} chưa đọc</p>
                        )}
                    </div>
                </div>

                {unread > 0 && (
                    <button
                        onClick={() => markAll()}
                        disabled={markingAll}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#639922] hover:text-[#4a7219] bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                    >
                        {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                        Đọc tất cả
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-6 h-6 animate-spin text-[#639922]" />
                    </div>
                ) : (error as any)?.response?.status === 403 ? (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
                        <AlertCircle className="w-4 h-4" /> Bạn không có quyền xem thông báo
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64 text-red-400 text-sm gap-2">
                        <AlertCircle className="w-4 h-4" /> Không thể tải thông báo
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <BellOff className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="font-semibold text-gray-600 text-sm">Không có thông báo</p>
                        <p className="text-xs text-gray-400 mt-1">Mọi thứ đang hoạt động bình thường</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onRead={markRead}
                            onDelete={deleteOne}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-t border-gray-100">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                        Trước
                    </button>
                    <span className="text-xs text-gray-500">
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                        Tiếp
                    </button>
                </div>
            )}
        </div>
    )
}