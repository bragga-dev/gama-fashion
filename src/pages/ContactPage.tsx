import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { applyFieldErrors, formLevelMessage } from '@/lib/errors'
import { maskPhone } from '@/lib/format'
import { contactService } from '@/services/catalog.service'

const schema = z.object({
  full_name: z.string().min(3, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  subject: z.string().min(3, 'Informe o assunto'),
  message: z.string().min(10, 'Escreva pelo menos 10 caracteres'),
})
type Values = z.infer<typeof schema>

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) })

  const submit = handleSubmit(async (v) => {
    setError(null)
    try { await contactService.send(v); setSent(true); reset() }
    catch (e) { if (!applyFieldErrors(e, setFieldError)) setError(formLevelMessage(e)) }
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center"><h1 className="text-3xl font-extrabold">Fale conosco</h1><p className="mt-2 text-brand-950/70">Dúvidas sobre tamanhos, pedidos ou trocas? Escreva para a gente.</p></div>
      <form onSubmit={submit} noValidate className="grid gap-4 rounded-[2rem] border border-brand-100 p-6 sm:grid-cols-2 sm:p-8">
        <Input label="Nome completo" error={errors.full_name?.message} {...register('full_name')} />
        <Input label="E-mail" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Telefone" inputMode="tel" error={errors.phone?.message} {...register('phone', { onChange: (e) => setValue('phone', maskPhone(e.target.value)) })} />
        <Input label="Assunto" error={errors.subject?.message} {...register('subject')} />
        <Textarea className="sm:col-span-2" label="Mensagem" error={errors.message?.message} {...register('message')} />
        {sent && <Alert tone="success" className="sm:col-span-2">Mensagem enviada! Responderemos em breve.</Alert>}
        {error && <Alert className="sm:col-span-2">{error}</Alert>}
        <Button type="submit" size="lg" className="sm:col-span-2" loading={isSubmitting}>Enviar mensagem</Button>
      </form>
    </div>
  )
}
