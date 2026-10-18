import { api } from '@/lib/api'
import type { Page } from '@/types/common'
import type { AppNotification } from '@/types/notification'

export const notificationService = {
  list: (page = 1, page_size = 10, unread_only = false) =>
    api
      .get<Page<AppNotification>>('/notifications', { params: { page, page_size, unread_only: unread_only || undefined } })
      .then((r) => r.data),
  unreadCount: () => api.get<{ unread: number }>('/notifications/unread-count').then((r) => r.data.unread),
  read: (id: string) => api.post(`/notifications/${id}/read`).then((r) => r.data),
  readAll: () => api.post('/notifications/read-all').then((r) => r.data),
  remove: (id: string) => api.delete(`/notifications/${id}`).then((r) => r.data),
}
