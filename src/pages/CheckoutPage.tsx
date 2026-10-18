import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, MapPin, Plus, Truck } from 'lucide-react'
import { AddressForm } from '@/components/AddressForm'
import { LineThumb } from '@/components/product/LineThumb'
import { Button } from '@/components/ui/Button'
import { Alert, PageLoader, Spinner } from '@/components/ui/misc'
import { useAddressMutations, useAddresses } from '@/hooks/useAccount'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/lib/errors'
import { lineTitle, variantInfo } from '@/lib/format'
import { formatBRL, toDecimal } from '@/lib/money'
import { cartService } from '@/services/cart.service'
import { orderService } from '@/services/order.service'

const card = 'rounded-[2rem] border border-brand-100 p-6'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: cart, isLoading: cartLoading } = useCart()
  const { data: addresses, isLoading: addrLoading } = useAddresses()
  const { create: createAddress } = useAddressMutations()

  const [addressId, setAddressId] = useState<string | null>(null)
  const [serviceCode, setServiceCode] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Seleciona o endereço preferencial (ou o primeiro) assim que a lista carregar.
  useEffect(() => {
    if (!addressId && addresses?.length) setAddressId((addresses.find((a) => a.is_preferential) ?? addresses[0]).address_id)
  }, [addresses, addressId])

  const address = addresses?.find((a) => a.address_id === addressId)

  // O back recota o frete pelo CEP do endereço escolhido; aqui só exibimos as opções.
  const quote = useQuery({
    queryKey: ['cart-quote', address?.cep],
    queryFn: async () => (await cartService.quoteShipping(address!.cep.replace(/\D/g, ''))).filter((o) => !o.error),
    enabled: !!address,
    retry: false,
  })
  useEffect(() => { setServiceCode(null) }, [address?.cep])

  if (cartLoading || addrLoading) return <PageLoader />
  if (!cart?.items.length) return <Navigate to="/carrinho" replace />

  const option = quote.data?.find((o) => (o.service_code ?? o.service) === serviceCode)
  const total = toDecimal(cart.total_price).plus(option ? toDecimal(option.price) : 0)

  const confirm = async () => {
    if (!addressId || !option) return
    setSubmitting(true); setError(null)
    try {
      const order = await orderService.create({ shipping_address_id: addressId, shipping_service_code: option.service_code ?? option.service })
      await Promise.all([qc.invalidateQueries({ queryKey: ['cart'] }), qc.invalidateQueries({ queryKey: ['orders'] })])
      navigate(`/pedido/${order.order_id}/pagamento`, { replace: true })
    } catch (e) {
      setError(getErrorMessage(e)); setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Finalizar compra</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><MapPin className="size-5 text-brand-700" /> 1. Endereço de entrega</h2>
            <div className="space-y-3">
              {addresses?.map((a) => (
                <button key={a.address_id} onClick={() => setAddressId(a.address_id)} aria-pressed={addressId === a.address_id}
                  className={cn('flex w-full items-start gap-3 rounded-3xl border-2 p-4 text-left transition', addressId === a.address_id ? 'border-brand-700 bg-brand-50' : 'border-brand-100 hover:border-brand-300')}>
                  <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2', addressId === a.address_id ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-300')}>{addressId === a.address_id && <Check className="size-3" />}</span>
                  <span className="text-sm"><span className="block font-bold">{a.street}, {a.number}{a.complement && ` — ${a.complement}`}</span>
                    <span className="text-brand-950/70">{a.neighborhood} · {a.city}/{a.state} · CEP {a.cep}</span></span>
                </button>
              ))}
              {adding || !addresses?.length ? (
                <div className="rounded-3xl bg-brand-50 p-5">
                  <p className="mb-4 font-semibold">Novo endereço</p>
                  <AddressForm submitLabel="Salvar e usar" onCancel={addresses?.length ? () => setAdding(false) : undefined}
                    onSubmit={async (body) => { const a = await createAddress.mutateAsync(body); setAddressId(a.address_id); setAdding(false) }} />
                </div>
              ) : <Button variant="secondary" size="sm" onClick={() => setAdding(true)}><Plus className="size-4" /> Usar outro endereço</Button>}
            </div>
          </section>

          <section className={cn(card, !address && 'opacity-60')}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Truck className="size-5 text-brand-700" /> 2. Forma de envio</h2>
            {!address ? <p className="text-sm text-brand-950/60">Selecione um endereço para ver as opções de frete.</p>
              : quote.isLoading ? <div className="flex justify-center py-4"><Spinner /></div>
              : quote.isError ? <Alert>{getErrorMessage(quote.error)}</Alert>
              : !quote.data?.length ? <Alert tone="info">Nenhuma opção de frete disponível para este CEP.</Alert>
              : <ul className="space-y-2">
                  {quote.data.map((o) => {
                    const code = o.service_code ?? o.service
                    return (
                      <li key={code}>
                        <button onClick={() => setServiceCode(code)} aria-pressed={serviceCode === code}
                          className={cn('flex w-full items-center justify-between gap-3 rounded-3xl border-2 px-5 py-3.5 text-left transition', serviceCode === code ? 'border-brand-700 bg-brand-50' : 'border-brand-100 hover:border-brand-300')}>
                          <span><span className="block text-sm font-bold">{o.carrier} · {o.service}</span>
                            <span className="text-xs text-brand-950/60">Até {o.delivery_time_days} dias úteis</span></span>
                          <span className="font-extrabold">{formatBRL(o.price)}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <div className="space-y-4 rounded-[2rem] bg-brand-50 p-6">
            <h2 className="text-lg font-bold">Seu pedido</h2>
            <ul className="space-y-3">
              {cart.items.map((i) => (
                <li key={i.cart_item_id} className="flex gap-3">
                  <LineThumb variant={i.variant} className="size-14" />
                  <div className="min-w-0 flex-1 text-sm"><p className="truncate font-semibold">{lineTitle(i.variant)}</p>
                    <p className="text-xs text-brand-950/60">{variantInfo(i.variant)} · {i.quantity_item}x</p></div>
                  <p className="text-sm font-bold">{formatBRL(i.subtotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-brand-200 pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">{formatBRL(cart.total_price)}</dd></div>
              <div className="flex justify-between"><dt>Frete</dt><dd className="font-semibold">{option ? formatBRL(option.price) : '—'}</dd></div>
            </dl>
            <div className="flex justify-between border-t border-brand-200 pt-3 text-lg font-extrabold"><span>Total</span><span>{formatBRL(total.toString())}</span></div>
            {error && <Alert>{error}</Alert>}
            <Button size="lg" className="w-full" disabled={!addressId || !option} loading={submitting} onClick={confirm}>Ir para o pagamento</Button>
            <p className="text-center text-xs text-brand-950/60">O valor final do frete é confirmado pelo servidor ao criar o pedido.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
