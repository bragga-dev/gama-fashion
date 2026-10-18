import { useRef, useState } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { Card, PageHeader } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/lib/errors'
import { adminProfile } from '@/services/admin.service'
import { authService } from '@/services/auth.service'

export default function AdminProfilePage() {
  const { me, reload } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(me?.admin?.full_name ?? '')
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [pw, setPw] = useState({ old_password: '', new_password: '', new_password2: '' })
  const [pwMsg, setPwMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const photo = me?.admin?.photo_url

  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    setBusy(true); setMsg(null)
    try { await fn(); await reload(); if (ok) setMsg({ tone: 'success', text: ok }) } catch (e) { setMsg({ tone: 'error', text: getErrorMessage(e) }) } finally { setBusy(false) }
  }

  return (
    <>
      <PageHeader title="Meu perfil" subtitle={me?.user.email} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5">
          <div className="flex items-center gap-4">
            {photo ? <img src={photo} alt="" className="size-20 rounded-full object-cover ring-4 ring-brand-100" />
              : <span className="flex size-20 items-center justify-center rounded-full bg-brand-700 text-2xl font-bold text-white">{name[0]?.toUpperCase()}</span>}
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void run(() => adminProfile.uploadPhoto(f), 'Foto atualizada.'); e.target.value = '' }} />
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}><Camera className="size-4" /> Alterar foto</Button>
              {photo && <Button size="sm" variant="ghost" onClick={() => void run(() => adminProfile.deletePhoto(), 'Foto removida.')}><Trash2 className="size-4" /> Remover</Button>}
            </div>
          </div>
          <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
          {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
          <Button loading={busy} disabled={name.trim().length < 2} onClick={() => void run(() => adminProfile.update(name.trim()), 'Perfil atualizado.')}>Salvar</Button>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-bold">Alterar senha</h2>
          <Input label="Senha atual" type="password" autoComplete="current-password" value={pw.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} />
          <Input label="Nova senha" type="password" autoComplete="new-password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
          <Input label="Confirmar nova senha" type="password" autoComplete="new-password" value={pw.new_password2} onChange={(e) => setPw({ ...pw, new_password2: e.target.value })} />
          {pwMsg && <Alert tone={pwMsg.tone}>{pwMsg.text}</Alert>}
          <Button variant="outline" disabled={!pw.old_password || pw.new_password.length < 8 || pw.new_password !== pw.new_password2}
            onClick={async () => { setPwMsg(null); try { await authService.changePassword(pw); setPw({ old_password: '', new_password: '', new_password2: '' }); setPwMsg({ tone: 'success', text: 'Senha alterada.' }) } catch (e) { setPwMsg({ tone: 'error', text: getErrorMessage(e) }) } }}>Atualizar senha</Button>
        </Card>
      </div>
    </>
  )
}