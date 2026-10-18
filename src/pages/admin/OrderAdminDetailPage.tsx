import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ExternalLink, PackageCheck, Tag } from 'lucide-react'
import { Card, Pill, orderTone, PageHeader } from '@/components/admin/AdminUI'
import { LineThumb } from '@/components/product/LineThumb'
import { Button } from '@/components/ui/Button'
import { Alert, PageLoader } from '@/components/ui/misc'
import { getErrorMessage } from '@/lib/errors'
import { formatDate, lineTitle, variantInfo } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { safeExternalUrl } from '@/lib/safe-url'
import { adminOrders } from '@/services/admin.service'

export default function OrderAdminDetailPage() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const { data: o, isLoading } = useQuery({ queryKey: ['admin', 'order', id], queryFn: () => adminOrders.get(id) })
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin'] }) }
  const label = useMutation({ mutationFn: () => adminOrders.generateLabel(id), onSuccess: refresh })
  const delivered = useMutation({ mutationFn: () => adminOrders.markDelivered(id), onSuccess: refresh })
  const error = label.error ?? delivered.error

  if (isLoading || !o) return <PageLoader />
  const paid = o.order_status === 'COMPLETED'
  const addr = o.shipping_address

  return (
    <>
      <Link to="/painel/pedidos" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"><ChevronLeft className="size-4" /> Pedidos</Link>
      <PageHeader title={`Pedido ${o.code}`} subtitle={`Criado em ${formatDate(o.created_at, true)}`}
        action={<div className="flex gap-2"><Pill tone={orderTone(o.order_status)}>{o.order_status_label}</Pill><Pill>{o.shipping_status_label}</Pill></div>} />
      {error && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}
      {label.data && <Alert tone="success" className="mb-4">Etiqueta gerada. Rastreio: <strong>{label.data.tracking_code}</strong></Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card><h2 className="mb-4 font-bold">Itens</h2>
            <ul className="space-y-3">{o.items.map((i) => (
              <li key={i.order_item_id} className="flex items-center gap-4">
                <LineThumb variant={i.variant} className="size-16" />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{lineTitle(i.variant)}</p><p className="text-xs text-brand-950/60">{variantInfo(i.variant)} · SKU {i.variant.sku ?? '—'}</p></div>
                <p className="text-sm">{i.order_item_quantity} × {formatBRL(i.order_item_price)}</p><p className="w-24 text-right font-bold">{formatBRL(i.subtotal)}</p>
              </li>))}</ul>
            <dl className="mt-4 space-y-1 border-t border-brand-100 pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBRL(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Frete ({o.shipping_service_name ?? '—'})</dt><dd>{formatBRL(o.order_shipping_total)}</dd></div>
              <div className="flex justify-between text-lg font-extrabold"><dt>Total</dt><dd>{formatBRL(o.total_geral)}</dd></div>
            </dl></Card>
        </div>

        <div className="space-y-6">
          <Card><h2 className="mb-3 font-bold">Cliente</h2><p className="font-semibold">{o.client_name ?? '—'}</p><p className="text-sm text-brand-950/70">{o.client_email}</p></Card>
          <Card><h2 className="mb-3 font-bold">Entrega</h2>
            {addr ? <p className="text-sm leading-relaxed">{addr.street}, {addr.number}{addr.complement && ` — ${addr.complement}`}<br />{addr.neighborhood} · {addr.city}/{addr.state}<br />CEP {addr.cep}</p> : <p className="text-sm text-brand-950/60">Endereço indisponível.</p>}
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Prazo</dt><dd>{o.shipping_delivery_days ? `${o.shipping_delivery_days} dias úteis` : '—'}</dd></div>
              <div className="flex justify-between"><dt>Rastreio</dt><dd className="select-all font-semibold">{o.shipping_tracking_code ?? '—'}</dd></div>
              {o.shipped_at && <div className="flex justify-between"><dt>Enviado em</dt><dd>{formatDate(o.shipped_at)}</dd></div>}
              {o.delivered_at && <div className="flex justify-between"><dt>Entregue em</dt><dd>{formatDate(o.delivered_at)}</dd></div>}
            </dl>
            {safeExternalUrl(o.shipping_label_url) && <a href={safeExternalUrl(o.shipping_label_url)!} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"><ExternalLink className="size-4" /> Abrir etiqueta</a>}
          </Card>
          <Card className="space-y-3"><h2 className="font-bold">Ações</h2>
            <Button className="w-full" disabled={!paid || o.shipping_status !== 'pending'} loading={label.isPending}
              onClick={() => { if (confirm('Gerar etiqueta na Frenet? O valor será debitado do saldo da carteira.')) label.mutate() }}><Tag className="size-4" /> Gerar etiqueta</Button>
            <Button className="w-full" variant="secondary" disabled={!paid || o.shipping_status === 'delivered'} loading={delivered.isPending}
              onClick={() => { if (confirm('Marcar como entregue?')) delivered.mutate() }}><PackageCheck className="size-4" /> Marcar como entregue</Button>
            {o.canceled_reason && <p className="text-xs text-brand-950/60">Cancelado: {o.canceled_reason}</p>}
          </Card>
        </div>
      </div>
    </>
  )
}