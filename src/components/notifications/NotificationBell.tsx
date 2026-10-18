import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationMutations, useNotifications, useUnreadCount } from '@/hooks/useAccount'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'
import { safeInternalPath } from '@/lib/safe-url'
import type { AppNotification } from '@/types/notification'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { data: unread = 0 } = useUnreadCount()
  const { data, isLoading } = useNotifications(1, 8, open)
  const { read, readAll } = useNotificationMutations()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const handleClick = (n: AppNotification) => {
    if (!n.is_read) read.mutate(n.notification_id)
    setOpen(false)
    // action_url é sempre um caminho relativo (o back descarta qualquer URL absoluta).
    const path = safeInternalPath(n.action_url)
    if (path) navigate(path)
  }

  return (
    <div ref={ref} className="relative">
      <IconButton label="Notificações" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </IconButton>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[92vw] overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-soft">
          <div className="flex items-center justify-between px-5 py-3">
            <p className="font-bold">Notificações</p>
            <button disabled={!unread} onClick={() => readAll.mutate()} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-40">
              <CheckCheck className="size-3.5" /> Marcar todas
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto border-t border-brand-100">
            {isLoading ? <div className="flex justify-center py-8"><Spinner /></div>
              : !data?.items.length ? <p className="px-5 py-8 text-center text-sm text-brand-950/60">Nenhuma notificação por aqui.</p>
              : data.items.map((n) => (
                <button key={n.notification_id} onClick={() => handleClick(n)}
                  className={cn('flex w-full gap-3 px-5 py-3 text-left transition hover:bg-brand-50', !n.is_read && 'bg-brand-50/60')}>
                  <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', n.is_read ? 'bg-transparent' : 'bg-brand-600')} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{n.title}</span>
                    <span className="line-clamp-2 text-xs text-brand-950/70">{n.body}</span>
                    <span className="mt-1 block text-[11px] text-brand-950/50">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              ))}
          </div>
          <Link to={isAdmin ? '/painel/notificacoes-admin' : '/painel/notificacoes'} onClick={() => setOpen(false)} className="block border-t border-brand-100 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50">
            Ver todas
          </Link>
        </div>
      )}
    </div>
  )
}