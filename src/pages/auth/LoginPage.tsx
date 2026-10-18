import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/lib/errors'
import { authService } from '@/services/auth.service'
import { AuthCard } from './AuthCard'
import { GoogleSection } from './GoogleButton'

const schema = z.object({ email: z.string().email('E-mail inválido'), password: z.string().min(1, 'Informe a senha') })
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) })

  if (isAuthenticated) return <Navigate to={from} replace />

  const done = async (access: string) => { await signIn(access); navigate(from, { replace: true }) }
  const submit = handleSubmit(async (v) => {
    setError(null)
    try { await done((await authService.login(v)).access) } catch (e) { setError(getErrorMessage(e)) }
  })

  return (
    <AuthCard title="Entrar" subtitle="Acesse sua conta Gama Fashion" footer={<>Novo por aqui? <Link to="/cadastro" state={{ from }} className="font-bold text-white underline">Crie sua conta</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Senha" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Entrar</Button>
        <p className="text-center text-sm"><Link to="/esqueci-senha" className="font-semibold text-brand-700 hover:underline">Esqueci minha senha</Link></p>
      </form>
      <GoogleSection onSuccess={done} />
    </AuthCard>
  )
}