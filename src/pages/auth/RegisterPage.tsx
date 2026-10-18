import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { applyFieldErrors, formLevelMessage } from '@/lib/errors'
import { authService } from '@/services/auth.service'
import { AuthCard } from './AuthCard'
import { GoogleSection } from './GoogleButton'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  password2: z.string(),
  accepted_terms: z.boolean().refine((v) => v, 'É necessário aceitar os Termos e a Política de Privacidade'),
  marketing_opt_in: z.boolean(),
}).refine((v) => v.password === v.password2, { path: ['password2'], message: 'As senhas não coincidem' })
type Values = z.infer<typeof schema>

export default function RegisterPage() {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema), defaultValues: { accepted_terms: false, marketing_opt_in: false },
  })
  if (isAuthenticated) return <Navigate to={from} replace />

  const submit = handleSubmit(async (v) => {
    setError(null)
    try {
      const { access } = await authService.register(v)
      await signIn(access)
      navigate(from, { replace: true })
    } catch (e) { if (!applyFieldErrors(e, setFieldError)) setError(formLevelMessage(e)) }
  })

  return (
    <AuthCard title="Criar conta" subtitle="Rápido e seguro" footer={<>Já tem conta? <Link to="/entrar" state={{ from }} className="font-bold text-white underline">Entrar</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Senha" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Input label="Confirmar senha" type="password" autoComplete="new-password" error={errors.password2?.message} {...register('password2')} />
        <Checkbox label={<>Li e aceito os <Link to="/termos" target="_blank" className="font-semibold text-brand-700 underline">Termos de Uso</Link> e a <Link to="/privacidade" target="_blank" className="font-semibold text-brand-700 underline">Política de Privacidade</Link>.</>} error={errors.accepted_terms?.message} {...register('accepted_terms')} />
        <Checkbox label="Quero receber novidades e ofertas por e-mail (opcional)." {...register('marketing_opt_in')} />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Criar conta</Button>
      </form>
      <GoogleSection termsAccepted={watch('accepted_terms')} onSuccess={async (access) => { await signIn(access); navigate(from, { replace: true }) }} />
    </AuthCard>
  )
}