import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-full border border-brand-200 bg-white px-5 text-sm text-brand-950 placeholder:text-brand-950/40 ' +
  'transition-colors focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-brand-50'

interface FieldShellProps {
  label?: string
  error?: string
  hint?: string
  children: (id: string) => ReactNode
  className?: string
}

export function FieldShell({ label, error, hint, children, className }: FieldShellProps) {
  const id = useId()
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <label htmlFor={id} className="ml-2 block text-sm font-medium text-brand-900">{label}</label>}
      {children(id)}
      {error ? <p role="alert" className="ml-2 text-xs font-medium text-red-600">{error}</p>
        : hint ? <p className="ml-2 text-xs text-brand-950/60">{hint}</p> : null}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string; icon?: ReactNode }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, className, ...rest }, ref,
) {
  return (
    <FieldShell label={label} error={error} hint={hint} className={className}>
      {(id) => (
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-600">{icon}</span>}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            className={cn(control, 'h-11', icon && 'pl-11', error && 'border-red-500 focus:border-red-500 focus:ring-red-100')}
            {...rest}
          />
        </div>
      )}
    </FieldShell>
  )
})

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, children, ...rest }, ref,
) {
  return (
    <FieldShell label={label} error={error} className={className}>
      {(id) => (
        <select ref={ref} id={id} className={cn(control, 'h-11 appearance-none bg-no-repeat pr-10', error && 'border-red-500')}
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b2d83' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: 'right 1rem center' }}
          {...rest}>
          {children}
        </select>
      )}
    </FieldShell>
  )
})

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, ...rest }, ref,
) {
  return (
    <FieldShell label={label} error={error} className={className}>
      {(id) => (
        <textarea ref={ref} id={id} rows={4}
          className={cn(control.replace('rounded-full', 'rounded-3xl'), 'py-3', error && 'border-red-500')} {...rest} />
      )}
    </FieldShell>
  )
})

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string }
>(function Checkbox({ label, error, className, ...rest }, ref) {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-brand-900">
        <input ref={ref} type="checkbox" className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-full border-brand-300 accent-brand-700" {...rest} />
        <span>{label}</span>
      </label>
      {error && <p role="alert" className="ml-8 mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
})
