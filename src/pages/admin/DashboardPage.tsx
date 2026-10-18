import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, MessageSquareText, Package, Star, Truck } from 'lucide-react'
import { Card, Pill, orderTone, PageHeader, StatCard, Table, td } from '@/components/admin/AdminUI'
import { PageLoader } from '@/components/ui/misc'
import { formatDate } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { adminContacts, adminOrders, adminReviews } from '@/services/admin.service'

const STATUS_LABEL: Record<string, string> = { PENDING: 'Pendentes', COMPLETED: 'Pagos', CANCELLED: 'Cancelados', REFUNDED: 'Estornados', FAILED: 'Falharam' }
const SHIP_LABEL: Record<string, string> = { pending: 'Aguardando etiqueta', label_generated: 'Etiqueta gerada', shipped: 'Enviados', in_transit: 'Em trânsito', delivered: 'Entregues' }

export default function DashboardPage() {
  const summary = useQuery({ queryKey: ['admin', 'summary'], queryFn: () => adminOrders.summary() })
  const recent = useQuery({ queryKey: ['admin', 'orders', 'recent'], queryFn: () => adminOrders.list({ page: 1, page_size: 6 }) })
  const pendingReviews = useQuery({ queryKey: ['admin', 'reviews', 'pending'], queryFn: adminReviews.pending })
  const pendingContacts = useQuery({ queryKey: ['admin', 'contacts', 'pending'], queryFn: () => adminContacts.list({ status: 'pending', page_size: 1 }) })

  if (summary.isLoading) return <PageLoader />
  const s = summary.data

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral da loja" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<DollarSign className="size-5" />} label="Faturamento" value={formatBRL(s?.revenue)} hint="Somente pedidos pagos" />
        <StatCard icon={<Package className="size-5" />} label="Pedidos" value={s?.total_orders ?? 0} hint={`Ticket médio ${formatBRL(s?.average_ticket)}`} />
        <StatCard icon={<Truck className="size-5" />} label="Aguardando envio" value={s?.awaiting_shipment ?? 0} hint="Pagos sem despacho" />
        <StatCard icon={<Star className="size-5" />} label="Avaliações a moderar" value={pendingReviews.data?.length ?? 0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card><h2 className="mb-3 font-bold">Pedidos por status</h2>
          <ul className="space-y-2 text-sm">{Object.entries(s?.by_status ?? {}).map(([k, v]) => (
            <li key={k} className="flex items-center justify-between"><Pill tone={orderTone(k)}>{STATUS_LABEL[k] ?? k}</Pill><strong>{v}</strong></li>))}</ul>
          <h2 className="mb-3 mt-6 font-bold">Envio (pagos)</h2>
          <ul className="space-y-2 text-sm">{Object.entries(s?.by_shipping_status ?? {}).map(([k, v]) => (
            <li key={k} className="flex items-center justify-between"><span>{SHIP_LABEL[k] ?? k}</span><strong>{v}</strong></li>))}</ul>
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <Link to="/painel/mensagens" className="flex items-center gap-4 rounded-[2rem] bg-brand-700 p-5 text-white transition hover:bg-brand-800">
            <MessageSquareText className="size-6" /><span className="flex-1 font-semibold">Mensagens de contato pendentes</span>
            <span className="text-2xl font-extrabold">{pendingContacts.data?.total ?? 0}</span>
          </Link>
          <Card>
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Pedidos recentes</h2>
              <Link to="/painel/pedidos" className="text-sm font-semibold text-brand-700 hover:underline">Ver todos</Link></div>
            <Table head={['Pedido', 'Cliente', 'Total', 'Status', 'Data']} empty={recent.data?.items.length ? undefined : 'Nenhum pedido ainda.'}>
              {recent.data?.items.map((o) => (
                <tr key={o.order_id} className="hover:bg-brand-50/60">
                  <td className={td}><Link className="font-bold text-brand-700 hover:underline" to={`/painel/pedidos/${o.order_id}`}>{o.code}</Link></td>
                  <td className={td}>{o.client_name ?? o.client_email}</td>
                  <td className={td}>{formatBRL(o.total_geral)}</td>
                  <td className={td}><Pill tone={orderTone(o.order_status)}>{o.order_status_label}</Pill></td>
                  <td className={td}>{formatDate(o.created_at)}</td>
                </tr>))}
            </Table>
          </Card>
        </div>
      </div>
    </>
  )
}