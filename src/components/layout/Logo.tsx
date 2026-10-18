import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" aria-label="Gama Fashion - Moda Fitness" className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="flex size-10 items-center justify-center rounded-full bg-brand-700 text-xl font-extrabold text-white shadow-soft">G</span>
      <span className={cn('flex flex-col leading-none', light ? 'text-white' : 'text-brand-950')}>
        <span className="text-lg font-extrabold tracking-tight">Gama Fashion</span>
        <span className={cn('mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em]', light ? 'text-brand-200' : 'text-brand-600')}>Moda Fitness</span>
      </span>
    </Link>
  )
}
