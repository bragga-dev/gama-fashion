import { useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { PageHeader, Pill, orderTone, Table, td } from '@/components/admin/AdminUI'
import { Input, Select } from '@/components/ui/Field'
import { Pagination, PageLoader } from '@/components/ui/misc'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { adminOrders } from '@/services/admin.service'
import type { OrderStatus, ShippingStatus } from '@/types/order'

export default function OrdersAdminPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [shipping, setShipping] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const q = useDebounce(search)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { page, q, status, shipping, from, to }],
    placeholderData: keepPreviousData,
    queryFn: () => adminOrders.list({ page, page_size: 15, search: q, order_status: (status || undefined) as OrderStatus | undefined, shipping_status: (shipping || undefined) as ShippingStatus | undefined, date_from: from, date_to: to }),
  })
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1) }

  return (
    <>
      <PageHeader title="Pedidos" subtitle={data ? `${data.total} pedidos` : undefined} />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input aria-label="Buscar" placeholder="Código, cliente ou e-mail" icon={<Search className="size-4" />} value={search} onChange={(e) => reset(setSearch)(e.target.value)} className="lg:col-span-2" />
        <Select aria-label="Status do pedido" value={status} onChange={(e) => reset(setStatus)(e.target.value)}>
          <option value="">Todos os status</option><option value="PENDING">Pendente</option><option value="COMPLETED">Pago</option>
          <option value="CANCELLED">Cancelado</option><option value="REFUNDED">Estornado</option><option value="FAILED">Falhou</option>
        </Select>
        <Select aria-label="Status do envio" value={shipping} onChange={(e) => reset(setShipping)(e.target.value)}>
          <option value="">Todos os envios</option><option value="pending">Aguardando etiqueta</option><option value="label_generated">Etiqueta gerada</option>
          <option value="shipped">Enviado</option><option value="in_transit">Em trânsito</option><option value="delivered">Entregue</option>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input aria-label="De" type="date" value={from} onChange={(e) => reset(setFrom)(e.target.value)} />
          <Input aria-label="Até" type="date" value={to} onChange={(e) => reset(setTo)(e.target.value)} />
        </div>
      </div>
      {isLoading ? <PageLoader /> : (
        <div className="space-y-6">
          <Table head={['Pedido', 'Cliente', 'Itens', 'Total', 'Pedido', 'Envio', 'Data']} empty={data?.items.length ? undefined : 'Nenhum pedido encontrado.'}>
            {data?.items.map((o) => (
              <tr key={o.order_id} className="hover:bg-brand-50/60">
                <td className={td}><Link to={`/painel/pedidos/${o.order_id}`} className="font-bold text-brand-700 hover:underline">{o.code}</Link></td>
                <td className={td}><p className="font-semibold">{o.client_name ?? '—'}</p><p className="text-xs text-brand-950/60">{o.client_email}</p></td>
                <td className={td}>{o.items_count}</td>
                <td className={td + ' font-bold'}>{formatBRL(o.total_geral)}</td>
                <td className={td}><Pill tone={orderTone(o.order_status)}>{o.order_status_label}</Pill></td>
                <td className={td}><Pill tone="brand">{o.shipping_status_label}</Pill></td>
                <td className={td}>{formatDate(o.created_at)}</td>
              </tr>))}
          </Table>
          {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
        </div>
      )}
    </>
  )
}