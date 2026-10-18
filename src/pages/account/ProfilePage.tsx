import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { applyFieldErrors, formLevelMessage, getErrorMessage } from '@/lib/errors'
import { maskCpf, maskPhone, onlyDigits } from '@/lib/format'
import { authService } from '@/services/auth.service'

const schema = z.object({
  first_name: z.string().min(2, 'Informe o nome'),
  last_name: z.string().min(2, 'Informe o sobrenome'),
  username: z.string().min(2, 'Mínimo de 2 caracteres'),
  phone: z.string().optional(),
  cpf: z.string().optional().refine((v) => !v || onlyDigits(v).length === 11, 'CPF deve ter 11 dígitos'),
  birth_date: z.string().optional(),
  gender: z.string().optional(),
})
type Values = z.infer<typeof schema>

const pwSchema = z.object({
  old_password: z.string().min(1, 'Informe a senha atual'),
  new_password: z.string().min(8, 'Mínimo de 8 caracteres'),
  new_password2: z.string(),
}).refine((v) => v.new_password === v.new_password2, { path: ['new_password2'], message: 'As senhas não coincidem' })
type PwValues = z.infer<typeof pwSchema>

export default function ProfilePage() {
  const { me, reload } = useAuth()
  const client = me?.client
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: client?.first_name ?? '', last_name: client?.last_name ?? '', username: client?.username ?? '',
      phone: client?.phone ? maskPhone(client.phone) : '', cpf: client?.cpf ? maskCpf(client.cpf) : '',
      birth_date: client?.birth_date ?? '', gender: client?.gender ?? '',
    },
  })
  const pwForm = useForm<PwValues>({ resolver: zodResolver(pwSchema) })

  if (!client) return <Alert tone="info">Perfil de cliente não encontrado para esta conta.</Alert>

  const save = form.handleSubmit(async (v) => {
    setMsg(null)
    try {
      await authService.updateClientProfile({
        first_name: v.first_name, last_name: v.last_name, username: v.username,
        phone: v.phone ? onlyDigits(v.phone) : undefined, cpf: v.cpf ? onlyDigits(v.cpf) : undefined,
        birth_date: v.birth_date || null, gender: v.gender || undefined,
      })
      await reload()
      setMsg({ tone: 'success', text: 'Dados atualizados com sucesso.' })
    } catch (e) {
      if (!applyFieldErrors(e, form.setError)) setMsg({ tone: 'error', text: formLevelMessage(e) ?? 'Revise os campos.' })
    }
  })

  const changePassword = pwForm.handleSubmit(async (v) => {
    setPwMsg(null)
    try {
      await authService.changePassword(v)
      pwForm.reset()
      setPwMsg({ tone: 'success', text: 'Senha alterada com sucesso.' })
    } catch (e) {
      if (!applyFieldErrors(e, pwForm.setError)) setPwMsg({ tone: 'error', text: getErrorMessage(e) })
    }
  })

  const onPhoto = async (file?: File) => {
    if (!file) return
    try { await authService.uploadClientPhoto(file); await reload() }
    catch (e) { setMsg({ tone: 'error', text: getErrorMessage(e) }) }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6 rounded-[2rem] border border-brand-100 p-6">
        <h2 className="text-2xl font-extrabold">Meus dados</h2>
        <div className="flex items-center gap-4">
          {client.photo_url
            ? <img src={client.photo_url} alt="" className="size-20 rounded-full object-cover ring-4 ring-brand-100" />
            : <span className="flex size-20 items-center justify-center rounded-full bg-brand-700 text-2xl font-bold text-white">{(client.first_name ?? me?.user.email)?.[0]?.toUpperCase()}</span>}
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void onPhoto(e.target.files?.[0])} />
            <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}><Camera className="size-4" /> Alterar foto</Button>
            {client.photo_url && <Button size="sm" variant="ghost" onClick={async () => { await authService.deleteClientPhoto(); await reload() }}><Trash2 className="size-4" /> Remover</Button>}
          </div>
        </div>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Input label="Nome" error={form.formState.errors.first_name?.message} {...form.register('first_name')} />
          <Input label="Sobrenome" error={form.formState.errors.last_name?.message} {...form.register('last_name')} />
          <Input label="Nome de usuário" error={form.formState.errors.username?.message} {...form.register('username')} />
          <Input label="E-mail" value={me?.user.email ?? ''} disabled readOnly />
          <Input label="Telefone" inputMode="tel" error={form.formState.errors.phone?.message} {...form.register('phone', { onChange: (e) => form.setValue('phone', maskPhone(e.target.value)) })} />
          <Input label="CPF" inputMode="numeric" error={form.formState.errors.cpf?.message} {...form.register('cpf', { onChange: (e) => form.setValue('cpf', maskCpf(e.target.value)) })} />
          <Input label="Data de nascimento" type="date" error={form.formState.errors.birth_date?.message} {...form.register('birth_date')} />
          <Select label="Gênero" {...form.register('gender')}>
            <option value="">Prefiro não informar</option>
            <option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option>
          </Select>
          {msg && <Alert className="sm:col-span-2" tone={msg.tone}>{msg.text}</Alert>}
          <div className="sm:col-span-2"><Button type="submit" size="lg" loading={form.formState.isSubmitting}>Salvar alterações</Button></div>
        </form>
      </section>

      <section className="space-y-4 rounded-[2rem] border border-brand-100 p-6">
        <h2 className="text-xl font-extrabold">Alterar senha</h2>
        <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-3" noValidate>
          <Input label="Senha atual" type="password" autoComplete="current-password" error={pwForm.formState.errors.old_password?.message} {...pwForm.register('old_password')} />
          <Input label="Nova senha" type="password" autoComplete="new-password" error={pwForm.formState.errors.new_password?.message} {...pwForm.register('new_password')} />
          <Input label="Confirmar nova senha" type="password" autoComplete="new-password" error={pwForm.formState.errors.new_password2?.message} {...pwForm.register('new_password2')} />
          {pwMsg && <Alert className="sm:col-span-3" tone={pwMsg.tone}>{pwMsg.text}</Alert>}
          <div className="sm:col-span-3"><Button type="submit" variant="outline" loading={pwForm.formState.isSubmitting}>Atualizar senha</Button></div>
        </form>
      </section>
    </div>
  )
}
