import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-brand-950/60">{subtitle}</p>}</div>
      {action}
    </div>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-[2rem] border border-brand-100 bg-white p-5 sm:p-6', className)}>{children}</div>
}

export function Modal({ open, title, onClose, children, wide }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-brand-950/50" onClick={onClose} />
      <div className={cn('relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-soft sm:rounded-[2rem]', wide ? 'max-w-3xl' : 'max-w-lg')}>
        <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2>
          <IconButton label="Fechar" onClick={onClose}><X className="size-5" /></IconButton></div>
        {children}
      </div>
    </div>
  )
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-brand-100">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-brand-50 text-xs uppercase tracking-wider text-brand-800">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-brand-100">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-10 text-center text-sm text-brand-950/60">{empty}</p>}
    </div>
  )
}

export const td = 'px-4 py-3 align-middle'

export function Pill({ children, tone = 'brand' }: { children: ReactNode; tone?: 'brand' | 'green' | 'amber' | 'red' | 'gray' | 'blue' }) {
  const tones = {
    brand: 'bg-brand-100 text-brand-800', green: 'bg-emerald-100 text-emerald-800', amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700', gray: 'bg-gray-200 text-gray-700', blue: 'bg-sky-100 text-sky-800',
  }
  return <span className={cn('inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold', tones[tone])}>{children}</span>
}

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { id: T; label: string }[] }) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto scrollbar-none" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cn('shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition', value === t.id ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-800 hover:bg-brand-100')}>{t.label}</button>
      ))}
    </div>
  )
}

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-[2rem] border border-brand-100 bg-white p-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">{icon}</span>
      <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-brand-950/50">{label}</p>
        <p className="truncate text-2xl font-extrabold">{value}</p>{hint && <p className="text-xs text-brand-950/60">{hint}</p>}</div>
    </div>
  )
}

export const orderTone = (s: string): 'green' | 'amber' | 'red' | 'gray' | 'blue' =>
  ({ COMPLETED: 'green', PENDING: 'amber', FAILED: 'red', CANCELLED: 'gray', REFUNDED: 'blue' } as const)[s as 'COMPLETED'] ?? 'gray'