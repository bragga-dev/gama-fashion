import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft, Star } from 'lucide-react'
import { LineThumb } from '@/components/product/LineThumb'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { Alert, EmptyState, PageLoader, StarRating } from '@/components/ui/misc'
import { useOrder } from '@/hooks/useAccount'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/lib/errors'
import { formatDate, lineTitle, ORDER_STATUS_TONE, variantInfo } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { orderService } from '@/services/order.service'
import { reviewService } from '@/services/catalog.service'
import type { ShippingStatus } from '@/types/order'

const STEPS: { key: ShippingStatus; label: string }[] = [
  { key: 'pending', label: 'Preparando' },
  { key: 'label_generated', label: 'Etiqueta gerada' },
  { key: 'shipped', label: 'Enviado' },
  { key: 'in_transit', label: 'Em trânsito' },
  { key: 'delivered', label: 'Entregue' },
]

function ReviewBox({ orderItemId, reviewed }: { orderItemId: string; reviewed: boolean }) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const save = useMutation({
    mutationFn: () => reviewService.create({ order_item_id: orderItemId, reviews: stars, comment: comment.trim() || undefined }),
    onSuccess: () => { setOpen(false); void qc.invalidateQueries({ queryKey: ['my-reviews'] }) },
  })
  if (reviewed || save.isSuccess) return <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check className="size-3.5" /> Avaliação enviada</p>
  if (!open) return <Button size="sm" variant="secondary" onClick={() => setOpen(true)}><Star className="size-4" /> Avaliar</Button>
  return (
    <div className="mt-2 w-full space-y-3 rounded-3xl bg-brand-50 p-4">
      <StarRating value={stars} size="size-6" onChange={setStars} />
      <Textarea aria-label="Comentário" placeholder="Conte como foi sua experiência (opcional)" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
      {save.error && <Alert>{getErrorMessage(save.error)}</Alert>}
      <div className="flex gap-2"><Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>Enviar avaliação</Button><Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button></div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data: order, isLoading, error } = useOrder(id)
  const { data: myReviews } = useQuery({ queryKey: ['my-reviews'], queryFn: reviewService.mine, enabled: order?.order_status === 'COMPLETED' })
  const cancel = useMutation({
    mutationFn: () => orderService.cancel(id!),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['orders'] }) },
  })

  if (isLoading) return <PageLoader />
  if (error || !order) return <EmptyState title="Pedido não encontrado" action={<ButtonLink to="/painel/meus-pedidos">Voltar aos pedidos</ButtonLink>} />

  const reviewed = new Set((myReviews ?? []).map((r) => r.order_item.order_item_id))
  const stepIndex = STEPS.findIndex((s) => s.key === order.shipping_status)
  const paid = order.order_status === 'COMPLETED'

  return (
    <div className="space-y-6">
      <Link to="/painel/meus-pedidos" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"><ChevronLeft className="size-4" /> Pedidos</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold">Pedido {order.code}</h2><p className="text-sm text-brand-950/60">Feito em {formatDate(order.created_at, true)}</p></div>
        <span className={cn('rounded-full px-4 py-1.5 text-sm font-bold', ORDER_STATUS_TONE[order.order_status])}>{order.order_status_label}</span>
      </div>

      {paid && (
        <div className="rounded-[2rem] border border-brand-100 p-6">
          <ol className="grid grid-cols-5 gap-1">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex flex-col items-center gap-2 text-center">
                <span className={cn('flex size-9 items-center justify-center rounded-full text-sm font-bold', i <= stepIndex ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-400')}>{i < stepIndex ? <Check className="size-4" /> : i + 1}</span>
                <span className={cn('text-[11px] font-semibold sm:text-xs', i <= stepIndex ? 'text-brand-900' : 'text-brand-950/40')}>{s.label}</span>
              </li>
            ))}
          </ol>
          {order.shipping_tracking_code && <p className="mt-5 rounded-full bg-brand-50 px-5 py-2.5 text-center text-sm">Código de rastreio: <strong className="select-all">{order.shipping_tracking_code}</strong></p>}
          {order.delivered_at && <p className="mt-3 text-center text-sm text-emerald-700">Entregue em {formatDate(order.delivered_at)}</p>}
        </div>
      )}

      <ul className="space-y-3">
        {order.items.map((i) => (
          <li key={i.order_item_id} className="flex flex-wrap items-center gap-4 rounded-3xl border border-brand-100 p-4">
            <LineThumb variant={i.variant} className="size-20" />
            <div className="min-w-0 flex-1"><p className="truncate font-bold">{lineTitle(i.variant)}</p>
              <p className="text-sm text-brand-950/60">{variantInfo(i.variant)} · {i.order_item_quantity}x {formatBRL(i.order_item_price)}</p></div>
            <p className="font-extrabold">{formatBRL(i.subtotal)}</p>
            {order.shipping_status === 'delivered' && <div className="w-full sm:w-auto"><ReviewBox orderItemId={i.order_item_id} reviewed={reviewed.has(i.order_item_id)} /></div>}
          </li>
        ))}
      </ul>

      <div className="space-y-2 rounded-[2rem] bg-brand-50 p-6 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">{formatBRL(order.subtotal)}</span></div>
        <div className="flex justify-between"><span>Frete{order.shipping_service_name && ` (${order.shipping_service_name})`}</span><span className="font-semibold">{formatBRL(order.order_shipping_total)}</span></div>
        <div className="flex justify-between border-t border-brand-200 pt-3 text-lg font-extrabold"><span>Total</span><span>{formatBRL(order.total_geral)}</span></div>
      </div>

      {cancel.error && <Alert>{getErrorMessage(cancel.error)}</Alert>}
      {order.order_status === 'PENDING' && (
        <div className="flex flex-wrap gap-3">
          <ButtonLink to={`/pedido/${order.order_id}/pagamento`} size="lg">Pagar agora</ButtonLink>
          <Button size="lg" variant="outline" loading={cancel.isPending} onClick={() => { if (confirm('Cancelar este pedido? O estoque será devolvido.')) cancel.mutate() }}>Cancelar pedido</Button>
        </div>
      )}
    </div>
  )
}
