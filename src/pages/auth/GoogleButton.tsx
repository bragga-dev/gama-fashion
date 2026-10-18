import { useState } from 'react'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Field'
import { Alert, Spinner } from '@/components/ui/misc'
import { env } from '@/lib/env'
import { toApiError } from '@/lib/errors'
import { authService } from '@/services/auth.service'
import { OrDivider } from './AuthCard'

interface Props {
  /** Recebe o access token já emitido pelo back (login 200 ou cadastro 201). */
  onSuccess: (access: string) => Promise<void>
  /** Pré-aceite vindo do formulário de cadastro (evita pedir de novo). */
  termsAccepted?: boolean
}

/**
 * Login/cadastro com Google (Google Identity Services).
 * Conta NOVA exige aceite dos termos: o back responde 400, mostramos o aceite e reenviamos o mesmo id_token.
 */
export function GoogleSection({ onSuccess, termsAccepted = false }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [terms, setTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)

  if (!env.googleClientId) {
    return import.meta.env.DEV ? (
      <Alert tone="info">Login com Google desativado: defina <code>VITE_GOOGLE_CLIENT_ID</code> no <code>.env</code> (mesmo valor do <code>GOOGLE_CLIENT_ID</code> do back).</Alert>
    ) : null
  }

  const send = async (idToken: string, accepted: boolean, marketingOptIn: boolean) => {
    setLoading(true); setError(null)
    try {
      const { access } = await authService.google({ id_token: idToken, accepted_terms: accepted, marketing_opt_in: marketingOptIn })
      await onSuccess(access)
    } catch (e) {
      const err = toApiError(e)
      // 400 = conta nova sem aceite dos termos.
      if (err.status === 400 && !accepted) setPendingToken(idToken)
      else { setPendingToken(null); setError(err.message) }
    } finally { setLoading(false) }
  }

  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
    <div className="space-y-4">
      <OrDivider />
      {pendingToken ? (
        <div className="space-y-4 rounded-3xl bg-brand-50 p-5">
          <p className="text-sm font-semibold">Quase lá! Para criar sua conta com o Google, confirme:</p>
          <Checkbox checked={terms} onChange={(e) => setTerms(e.target.checked)} label={<>Li e aceito os <Link to="/termos" target="_blank" className="font-semibold text-brand-700 underline">Termos de Uso</Link> e a <Link to="/privacidade" target="_blank" className="font-semibold text-brand-700 underline">Política de Privacidade</Link>.</>} />
          <Checkbox checked={marketing} onChange={(e) => setMarketing(e.target.checked)} label="Quero receber novidades e ofertas por e-mail (opcional)." />
          {error && <Alert>{error}</Alert>}
          <div className="flex gap-2">
            <Button disabled={!terms} loading={loading} onClick={() => void send(pendingToken, true, marketing)}>Criar conta</Button>
            <Button variant="ghost" onClick={() => { setPendingToken(null); setTerms(false) }}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative flex min-h-11 justify-center">
            {loading
              ? <Spinner />
              : <GoogleLogin width="320" theme="outline" size="large" shape="pill" text="continue_with"
                  onSuccess={(r) => { if (r.credential) void send(r.credential, termsAccepted, false) }}
                  onError={() => setError('Não foi possível entrar com o Google. Tente novamente.')} />}
          </div>
          {error && <Alert>{error}</Alert>}
        </>
      )}
    </div>
    </GoogleOAuthProvider>
  )
}