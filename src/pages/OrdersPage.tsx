import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { LineThumb } from '@/components/product/LineThumb'
import { ButtonLink } from '@/components/ui/Button'
import { Alert, EmptyState, PageLoader } from '@/components/ui/misc'
import { useOrders } from '@/hooks/useAccount'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/lib/errors'
import { formatDate, ORDER_STATUS_TONE } from '@/lib/format'
import { formatBRL } from '@/lib/money'

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders()
  if (isLoading) return <PageLoader />
  if (error) return <Alert>{getErrorMessage(error)}</Alert>
  if (!orders?.length) {
    return <EmptyState icon={<Package className="size-7" />} title="Você ainda não fez pedidos" text="Quando comprar, seus pedidos aparecem aqui." action={<ButtonLink to="/produtos">Ver produtos</ButtonLink>} />
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold">Meus pedidos</h2>
      {orders.map((o) => (
        <Link key={o.order_id} to={`/painel/meus-pedidos/${o.order_id}`} className="block space-y-3 rounded-3xl border border-brand-100 p-5 transition hover:border-brand-400 hover:shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="font-extrabold">Pedido {o.code}</p><p className="text-xs text-brand-950/60">{formatDate(o.created_at, true)}</p></div>
            <span className={cn('rounded-full px-3 py-1 text-xs font-bold', ORDER_STATUS_TONE[o.order_status])}>{o.order_status_label}</span>
          </div>
          <div className="flex items-center gap-2">
            {o.items.slice(0, 4).map((i) => <LineThumb key={i.order_item_id} variant={i.variant} className="size-14" />)}
            {o.items.length > 4 && <span className="text-sm font-semibold text-brand-950/60">+{o.items.length - 4}</span>}
            <p className="ml-auto text-lg font-extrabold">{formatBRL(o.total_geral)}</p>
          </div>
          <p className="text-xs text-brand-950/60">Envio: {o.shipping_status_label}</p>
        </Link>
      ))}
    </div>
  )
}
