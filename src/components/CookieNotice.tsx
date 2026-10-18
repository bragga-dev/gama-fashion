import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const KEY = 'gama-cookie-notice-v1'

/** Aviso informativo: a loja só usa cookie essencial (sessão). O Google define cookies próprios apenas no login com Google. */
export function CookieNotice() {
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem(KEY) } catch { return true }
  })
  if (!visible) return null
  const accept = () => {
    try { localStorage.setItem(KEY, '1') } catch { /* sem storage: apenas fecha */ }
    setVisible(false)
  }
  return (
    <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-3xl flex-col gap-3 rounded-[2rem] border border-brand-100 bg-white p-5 shadow-soft sm:flex-row sm:items-center">
      <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 sm:flex"><Cookie className="size-5" /></span>
      <p className="flex-1 text-sm text-brand-950/80">
        Usamos apenas cookies essenciais para manter sua sessão e o carrinho. O login com Google pode usar cookies do Google.
        Saiba mais na <Link to="/privacidade" className="font-semibold text-brand-700 underline">Política de Privacidade</Link>.
      </p>
      <Button size="sm" onClick={accept}>Entendi</Button>
    </div>
  )
}