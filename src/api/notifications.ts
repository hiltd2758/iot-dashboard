import api from "./axios";
import type { ApiResponse, NotificationDTO, UnreadCountDTO, PageResponse } from "@/types";

export const notificationApi = {
  getNotifications: (page = 0, size = 10) =>
    api.get<ApiResponse<PageResponse<NotificationDTO>>>(`/api/v1/notifications`, {
      params: { page, size },
    }),

  getUnreadCount: () =>
    api.get<ApiResponse<UnreadCountDTO>>(`/api/v1/notifications/unread-count`),

  markAsRead: (id: string) =>
    api.patch<ApiResponse<NotificationDTO>>(`/api/v1/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch<ApiResponse<void>>(`/api/v1/notifications/read-all`),

  deleteNotification: (id: string) =>
    api.delete<void>(`/api/v1/notifications/${id}`),
};