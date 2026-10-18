import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState, PageLoader, Pagination } from '@/components/ui/misc'
import { useNotificationMutations, useNotifications } from '@/hooks/useAccount'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { safeInternalPath } from '@/lib/safe-url'

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useNotifications(page, 15)
  const { read, readAll, remove } = useNotificationMutations()
  const navigate = useNavigate()

  if (isLoading) return <PageLoader />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Notificações</h2>
        <Button size="sm" variant="secondary" onClick={() => readAll.mutate()} loading={readAll.isPending}><CheckCheck className="size-4" /> Marcar todas como lidas</Button>
      </div>
      {!data?.items.length ? <EmptyState icon={<Bell className="size-7" />} title="Nenhuma notificação" text="Avisos sobre pedidos e pagamentos aparecem aqui." /> : (
        <ul className="space-y-2">
          {data.items.map((n) => (
            <li key={n.notification_id} className={cn('flex items-start gap-3 rounded-3xl border p-4', n.is_read ? 'border-brand-100' : 'border-brand-300 bg-brand-50')}>
              <button className="min-w-0 flex-1 text-left" onClick={() => { if (!n.is_read) read.mutate(n.notification_id); const path = safeInternalPath(n.action_url); if (path) navigate(path) }}>
                <p className="font-bold">{n.title}</p><p className="text-sm text-brand-950/70">{n.body}</p>
                <p className="mt-1 text-xs text-brand-950/50">{formatDate(n.created_at, true)}</p>
              </button>
              <button aria-label="Excluir notificação" onClick={() => remove.mutate(n.notification_id)} className="flex size-9 items-center justify-center rounded-full text-brand-950/50 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </div>
  )
}