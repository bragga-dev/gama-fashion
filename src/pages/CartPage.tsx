import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { LineThumb } from '@/components/product/LineThumb'
import { ShippingCalculator } from '@/components/product/ShippingCalculator'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Alert, EmptyState, PageLoader, QuantityStepper } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { useCart, useCartMutations } from '@/hooks/useCart'
import { getErrorMessage } from '@/lib/errors'
import { lineTitle, variantInfo } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { cartService } from '@/services/cart.service'

export default function CartPage() {
  const { isAuthenticated, isClient, isLoading: authLoading } = useAuth()
  const { data: cart, isLoading } = useCart()
  const { update, remove, clear } = useCartMutations()

  if (authLoading || (isClient && isLoading)) return <PageLoader />

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState icon={<ShoppingBag className="size-7" />} title="Entre para ver seu carrinho" text="Faça login ou crie sua conta para montar o carrinho e finalizar a compra."
          action={<div className="flex gap-3"><ButtonLink to="/entrar" state={{ from: '/carrinho' }}>Entrar</ButtonLink><ButtonLink to="/cadastro" variant="outline">Criar conta</ButtonLink></div>} />
      </div>
    )
  }
  if (!isClient) return <div className="mx-auto max-w-2xl px-4 py-16"><Alert tone="info">Contas administrativas não possuem carrinho.</Alert></div>

  if (!cart?.items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState icon={<ShoppingBag className="size-7" />} title="Seu carrinho está vazio" text="Que tal conhecer as novidades?" action={<ButtonLink to="/produtos?sort=recent">Ver novidades</ButtonLink>} />
      </div>
    )
  }

  const error = update.error ?? remove.error ?? clear.error

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Carrinho</h1>
      {error && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <ul className="space-y-3">
          {cart.items.map((item) => (
            <li key={item.cart_item_id} className="flex gap-4 rounded-3xl border border-brand-100 p-4">
              <LineThumb variant={item.variant} className="size-24 sm:size-28" />
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{lineTitle(item.variant)}</p>
                    <p className="text-sm text-brand-950/60">{variantInfo(item.variant)}</p>
                    <p className="mt-1 text-sm">{formatBRL(item.unit_price_item)} cada</p>
                  </div>
                  <p className="font-extrabold">{formatBRL(item.subtotal)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper value={item.quantity_item} max={Math.max(item.variant.stock, 1)}
                    disabled={update.isPending} onChange={(q) => update.mutate({ itemId: item.cart_item_id, quantity: q })} />
                  <button onClick={() => remove.mutate(item.cart_item_id)} aria-label="Remover item" className="flex size-10 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </li>
          ))}
          <li><Button variant="ghost" size="sm" onClick={() => clear.mutate()} loading={clear.isPending}>Esvaziar carrinho</Button></li>
        </ul>

        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <div className="space-y-3 rounded-[2rem] bg-brand-50 p-6">
            <h2 className="text-lg font-bold">Resumo</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{formatBRL(cart.total_price)}</dd></div>
              <div className="flex justify-between text-brand-950/70"><dt>Frete</dt><dd>calculado no checkout</dd></div>
            </dl>
            <div className="flex justify-between border-t border-brand-200 pt-3 text-lg font-extrabold"><span>Total</span><span>{formatBRL(cart.total_price)}</span></div>
            <ButtonLink to="/checkout" size="lg" className="w-full">Finalizar compra</ButtonLink>
            <Link to="/produtos" className="block text-center text-sm font-semibold text-brand-700 hover:underline">Continuar comprando</Link>
          </div>
          <ShippingCalculator quote={cartService.quoteShipping} />
        </aside>
      </div>
    </div>
  )
}
