import { createContext, useCallback, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/cn'

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}
type Ask = (input: string | ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<Ask | null>(null)

/** Aceita string ("Excluir X? Detalhe.") ou opções; a 1ª frase vira título e o resto a mensagem. */
function normalize(input: string | ConfirmOptions): ConfirmOptions {
  if (typeof input !== 'string') return input
  const m = input.match(/^(.*?[?.!])\s+([\s\S]*)$/)
  const title = m ? m[1] : input
  const first = title.split(' ')[0].replace(/[^\p{L}]/gu, '')
  return {
    title,
    message: m?.[2],
    confirmLabel: first || 'Confirmar',
    tone: /^(excluir|cancelar|desativar)/i.test(first) ? 'danger' : 'primary',
  }
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  const ask = useCallback<Ask>((input) => new Promise<boolean>((resolve) => {
    previousFocus.current = document.activeElement as HTMLElement | null
    setState({ opts: normalize(input), resolve })
  }), [])

  const close = useCallback((result: boolean) => {
    setState((s) => { s?.resolve(result); return null })
    previousFocus.current?.focus?.()
  }, [])

  useEffect(() => {
    if (!state) return
    // Ação destrutiva: foco começa em "Voltar" para evitar confirmação acidental com Enter.
    ;(state.opts.tone === 'danger' ? cancelRef : confirmRef).current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [state])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(false) }
    if (e.key === 'Tab') {
      e.preventDefault()
      ;(document.activeElement === cancelRef.current ? confirmRef : cancelRef).current?.focus()
    }
  }

  const o = state?.opts
  const danger = o?.tone === 'danger'

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {o && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onKeyDown={onKeyDown}>
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-[2px]" onClick={() => close(false)} />
          <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby={o.message ? 'confirm-desc' : undefined}
            className="animate-fade relative w-full max-w-md space-y-5 rounded-[2rem] bg-white p-7 text-center shadow-soft">
            <span className={cn('mx-auto flex size-16 items-center justify-center rounded-full', danger ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-700')}>
              {danger ? <AlertTriangle className="size-7" /> : <HelpCircle className="size-7" />}
            </span>
            <div className="space-y-2">
              <h2 id="confirm-title" className="text-xl font-extrabold">{o.title}</h2>
              {o.message && <p id="confirm-desc" className="text-sm leading-relaxed text-brand-950/70">{o.message}</p>}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button ref={cancelRef} variant="secondary" className="sm:min-w-32" onClick={() => close(false)}>{o.cancelLabel ?? 'Voltar'}</Button>
              <Button ref={confirmRef} variant={danger ? 'danger' : 'primary'} className="sm:min-w-32" onClick={() => close(true)}>{o.confirmLabel ?? 'Confirmar'}</Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm(): Ask {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm deve ser usado dentro de <ConfirmProvider>')
  return ctx
}