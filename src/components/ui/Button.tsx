import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white shadow-soft hover:bg-brand-800',
  secondary: 'bg-brand-100 text-brand-800 hover:bg-brand-200',
  outline: 'border-2 border-brand-700 text-brand-700 hover:bg-brand-50',
  ghost: 'text-brand-800 hover:bg-brand-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  white: 'bg-white text-brand-800 shadow-soft hover:bg-brand-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={buttonClass(variant, size, className)} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
})

export function ButtonLink({
  variant, size, className, ...rest
}: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />
}

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(
  function IconButton({ label, className, children, type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        className={cn(
          'relative inline-flex size-11 items-center justify-center rounded-full text-brand-900 transition-colors',
          'hover:bg-brand-100 active:scale-95 disabled:opacity-50',
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    )
  },
)
