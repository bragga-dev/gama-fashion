import { api } from '@/lib/api'
import type { Cart } from '@/types/cart'
import type { ShippingOption } from '@/types/product'

export const cartService = {
  get: () => api.get<Cart>('/cart').then((r) => r.data),
  clear: () => api.delete<Cart>('/cart').then((r) => r.data),
  addItem: (variant_id: string, quantity_item = 1) =>
    api.post<Cart>('/cart/items', { variant_id, quantity_item }).then((r) => r.data),
  updateItem: (cartItemId: string, quantity_item: number) =>
    api.patch<Cart>(`/cart/items/${cartItemId}`, { quantity_item }).then((r) => r.data),
  removeItem: (cartItemId: string) => api.delete<Cart>(`/cart/items/${cartItemId}`).then((r) => r.data),
  quoteShipping: (recipient_cep: string) =>
    api.post<ShippingOption[]>('/cart/shipping/quote', { recipient_cep }).then((r) => r.data),
}
