import { type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Minus, Plus, Star } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-6 animate-spin text-brand-700', className)} />
}

export function PageLoader() {
  return <div className="flex min-h-[40vh] items-center justify-center"><Spinner className="size-8" /></div>
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-brand-100', className)} />
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800', className)}>
      {children}
    </span>
  )
}

export function Alert({ tone = 'error', children, className }: { tone?: 'error' | 'success' | 'info'; children: ReactNode; className?: string }) {
  const tones = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    info: 'bg-brand-50 text-brand-800 border-brand-200',
  }
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm', tones[tone], className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-brand-50 px-6 py-14 text-center">
      {icon && <div className="flex size-16 items-center justify-center rounded-full bg-white text-brand-700 shadow-card">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="max-w-md text-sm text-brand-950/70">{text}</p>}
      {action}
    </div>
  )
}

export function QuantityStepper({
  value, onChange, min = 1, max = 99, disabled,
}: { value: number; onChange: (n: number) => void; min?: number; max?: number; disabled?: boolean }) {
  const btn = 'flex size-9 items-center justify-center rounded-full text-brand-800 transition hover:bg-brand-100 disabled:opacity-40'
  return (
    <div className="inline-flex items-center rounded-full border border-brand-200 bg-white p-0.5">
      <button type="button" aria-label="Diminuir" className={btn} disabled={disabled || value <= min} onClick={() => onChange(value - 1)}><Minus className="size-4" /></button>
      <span className="w-9 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" aria-label="Aumentar" className={btn} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}><Plus className="size-4" /></button>
    </div>
  )
}

export function StarRating({ value, size = 'size-4', onChange }: { value: number; size?: string; onChange?: (n: number) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5" role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = <Star className={cn(size, n <= Math.round(value) ? 'fill-brand-600 text-brand-600' : 'text-brand-200')} />
        return onChange ? (
          <button key={n} type="button" aria-label={`${n} estrelas`} onClick={() => onChange(n)} className="rounded-full p-0.5 hover:scale-110 transition">{star}</button>
        ) : <span key={n}>{star}</span>
      })}
    </div>
  )
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  const items: (number | '…')[] = []
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) items.push(p)
    else if (items[items.length - 1] !== '…') items.push('…')
  }
  const nav = 'flex size-10 items-center justify-center rounded-full transition disabled:opacity-40'
  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1.5">
      <button className={cn(nav, 'hover:bg-brand-100')} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior"><ChevronLeft className="size-5" /></button>
      {items.map((it, i) => it === '…'
        ? <span key={`e${i}`} className="px-1 text-brand-950/40">…</span>
        : <button key={it} onClick={() => onChange(it)} aria-current={it === page ? 'page' : undefined}
            className={cn(nav, 'text-sm font-semibold', it === page ? 'bg-brand-700 text-white' : 'hover:bg-brand-100')}>{it}</button>)}
      <button className={cn(nav, 'hover:bg-brand-100')} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Próxima página"><ChevronRight className="size-5" /></button>
    </nav>
  )
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-brand-950/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
