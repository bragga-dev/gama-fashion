import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { addressService } from '@/services/address.service'
import { notificationService } from '@/services/notification.service'
import { orderService, paymentService } from '@/services/order.service'
import type { AddressIn } from '@/types/address'

export const useAddresses = () => {
  const { isClient } = useAuth()
  return useQuery({
    queryKey: ['addresses'],
    enabled: isClient,
    queryFn: async () => {
      try {
        return await addressService.list()
      } catch (e: unknown) {
        // O back responde 404 quando o cliente ainda não tem endereço.
        if ((e as { response?: { status?: number } })?.response?.status === 404) return []
        throw e
      }
    },
  })
}

export function useAddressMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['addresses'] })
  return {
    create: useMutation({ mutationFn: (b: AddressIn) => addressService.create(b), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: (v: { id: string; body: Partial<AddressIn> }) => addressService.update(v.id, v.body),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => addressService.remove(id), onSuccess: invalidate }),
    setPreferential: useMutation({ mutationFn: (id: string) => addressService.setPreferential(id), onSuccess: invalidate }),
  }
}

export const useOrders = () => {
  const { isClient } = useAuth()
  return useQuery({ queryKey: ['orders'], queryFn: orderService.list, enabled: isClient })
}

export const useOrder = (id?: string) =>
  useQuery({ queryKey: ['orders', id], queryFn: () => orderService.get(id!), enabled: !!id })

export const useOrderPayments = (orderId?: string, poll = false) =>
  useQuery({
    queryKey: ['payments', orderId],
    queryFn: () => paymentService.listByOrder(orderId!),
    enabled: !!orderId,
    refetchInterval: poll ? 5000 : false,
  })

/** Sino: badge a cada 45 s, pausa com a aba oculta e refaz ao focar (contrato §6). */
export function useUnreadCount() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationService.unreadCount,
    enabled: isAuthenticated,
    refetchInterval: 45_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })
}

export const useNotifications = (page = 1, pageSize = 10, enabled = true) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['notifications', 'list', page, pageSize],
    queryFn: () => notificationService.list(page, pageSize),
    enabled: isAuthenticated && enabled,
  })
}

export function useNotificationMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['notifications'] })
  return {
    read: useMutation({ mutationFn: (id: string) => notificationService.read(id), onSuccess: invalidate }),
    readAll: useMutation({ mutationFn: notificationService.readAll, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => notificationService.remove(id), onSuccess: invalidate }),
  }
}
