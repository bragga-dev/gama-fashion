import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { applyFieldErrors, formLevelMessage, getErrorMessage } from '@/lib/errors'
import { authService } from '@/services/auth.service'
import { AuthCard } from './AuthCard'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>({ resolver: zodResolver(z.object({ email: z.string().email('E-mail inválido') })) })
  return (
    <AuthCard title="Recuperar senha" subtitle="Enviaremos um link para redefinir" footer={<Link to="/entrar" className="font-bold text-white underline">Voltar ao login</Link>}>
      {sent ? <Alert tone="success">Se o e-mail estiver cadastrado, você receberá as instruções em instantes.</Alert> : (
        <form className="space-y-4" noValidate onSubmit={handleSubmit(async ({ email }) => {
          setError(null)
          try { await authService.requestPasswordReset(email); setSent(true) } catch (e) { setError(getErrorMessage(e)) }
        })}>
          <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Enviar link</Button>
        </form>
      )}
    </AuthCard>
  )
}

const resetSchema = z.object({ new_password: z.string().min(8, 'Mínimo de 8 caracteres'), new_password2: z.string() })
  .refine((v) => v.new_password === v.new_password2, { path: ['new_password2'], message: 'As senhas não coincidem' })

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const uid = params.get('uid') ?? '', token = params.get('token') ?? ''
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) })

  if (!uid || !token) return <AuthCard title="Link inválido"><Alert>O link de redefinição está incompleto ou expirou.</Alert><ButtonLink to="/esqueci-senha" className="w-full">Solicitar novo link</ButtonLink></AuthCard>
  return (
    <AuthCard title="Nova senha">
      {done ? <div className="space-y-4"><Alert tone="success">Senha redefinida com sucesso!</Alert><ButtonLink to="/entrar" size="lg" className="w-full">Entrar</ButtonLink></div> : (
        <form className="space-y-4" noValidate onSubmit={handleSubmit(async (v) => {
          setError(null)
          try { await authService.confirmPasswordReset({ uid, token, ...v }); setDone(true) }
          catch (e) { if (!applyFieldErrors(e, setFieldError)) setError(formLevelMessage(e)) }
        })}>
          <Input label="Nova senha" type="password" autoComplete="new-password" error={errors.new_password?.message} {...register('new_password')} />
          <Input label="Confirmar senha" type="password" autoComplete="new-password" error={errors.new_password2?.message} {...register('new_password2')} />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Redefinir senha</Button>
        </form>
      )}
    </AuthCard>
  )
}

/** Destino do redirect do back: /verificacao-concluida?status=success|error */
export function EmailVerifiedPage() {
  const [params] = useSearchParams()
  const ok = params.get('status') === 'success'
  return (
    <AuthCard title={ok ? 'E-mail confirmado!' : 'Não foi possível confirmar'}>
      <div className="flex flex-col items-center gap-4 text-center">
        {ok ? <CheckCircle2 className="size-16 text-emerald-500" /> : <XCircle className="size-16 text-red-500" />}
        <p className="text-sm text-brand-950/70">{ok ? 'Sua conta está verificada. Já pode aproveitar a loja.' : params.get('message') ?? 'O link é inválido ou expirou.'}</p>
        <ButtonLink to={ok ? '/entrar' : '/'} size="lg" className="w-full">{ok ? 'Entrar' : 'Ir para a loja'}</ButtonLink>
      </div>
    </AuthCard>
  )
}
