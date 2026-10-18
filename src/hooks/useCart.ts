import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { cartService } from '@/services/cart.service'
import type { Cart } from '@/types/cart'

export const CART_KEY = ['cart'] as const

export function useCart() {
  const { isClient } = useAuth()
  return useQuery({ queryKey: CART_KEY, queryFn: cartService.get, enabled: isClient })
}

export const cartCount = (cart?: Cart) => cart?.items.reduce((n, i) => n + i.quantity_item, 0) ?? 0

/** Toda mutação do carrinho devolve o CartOut completo: basta gravá-lo no cache. */
export function useCartMutations() {
  const qc = useQueryClient()
  const sync = (cart: Cart) => qc.setQueryData(CART_KEY, cart)
  return {
    add: useMutation({
      mutationFn: (v: { variantId: string; quantity?: number }) => cartService.addItem(v.variantId, v.quantity ?? 1),
      onSuccess: sync,
    }),
    update: useMutation({
      mutationFn: (v: { itemId: string; quantity: number }) => cartService.updateItem(v.itemId, v.quantity),
      onSuccess: sync,
    }),
    remove: useMutation({ mutationFn: (itemId: string) => cartService.removeItem(itemId), onSuccess: sync }),
    clear: useMutation({ mutationFn: cartService.clear, onSuccess: sync }),
  }
}
