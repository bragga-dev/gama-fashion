import { api } from '@/lib/api'
import type { Order, OrderCreateIn } from '@/types/order'
import type { Payment, PaymentCreateIn } from '@/types/payment'

export const orderService = {
  create: (body: OrderCreateIn) => api.post<Order>('/orders', body).then((r) => r.data),
  list: () => api.get<Order[]>('/orders').then((r) => r.data),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  cancel: (id: string, reason?: string) => api.post<Order>(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
}

export const paymentService = {
  create: (orderId: string, body: PaymentCreateIn) =>
    api.post<Payment>(`/orders/${orderId}/payments`, body).then((r) => r.data),
  listByOrder: (orderId: string) => api.get<Payment[]>(`/orders/${orderId}/payments`).then((r) => r.data),
  get: (paymentId: string) => api.get<Payment>(`/payments/${paymentId}`).then((r) => r.data),
}
