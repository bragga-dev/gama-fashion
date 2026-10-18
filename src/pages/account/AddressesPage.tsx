import { useState } from 'react'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { MapPin, Plus, Star, Trash2 } from 'lucide-react'
import { AddressForm } from '@/components/AddressForm'
import { Button } from '@/components/ui/Button'
import { Alert, Badge, PageLoader } from '@/components/ui/misc'
import { useAddressMutations, useAddresses } from '@/hooks/useAccount'
import { getErrorMessage } from '@/lib/errors'

export default function AddressesPage() {
  const confirm = useConfirm()
  const { data: addresses, isLoading } = useAddresses()
  const { create, update, remove, setPreferential } = useAddressMutations()
  const [mode, setMode] = useState<'list' | 'new' | string>('list')
  const error = remove.error ?? setPreferential.error

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Meus endereços</h2>
        {mode === 'list' && !!addresses?.length && <Button size="sm" onClick={() => setMode('new')}><Plus className="size-4" /> Novo endereço</Button>}
      </div>
      {error && <Alert>{getErrorMessage(error)}</Alert>}

      {mode === 'new' || (!addresses?.length && mode === 'list') ? (
        <div className="rounded-[2rem] border border-brand-100 p-6">
          {!addresses?.length && <p className="mb-4 text-sm text-brand-950/70">Cadastre seu primeiro endereço de entrega.</p>}
          <AddressForm onCancel={addresses?.length ? () => setMode('list') : undefined} onSubmit={async (b) => { await create.mutateAsync(b); setMode('list') }} />
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {addresses?.map((a) => (
            <li key={a.address_id} className="space-y-3 rounded-3xl border border-brand-100 p-5">
              {mode === a.address_id ? (
                <AddressForm initial={a} onCancel={() => setMode('list')} onSubmit={async (b) => { await update.mutateAsync({ id: a.address_id, body: b }); setMode('list') }} />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex items-center gap-2 font-bold"><MapPin className="size-4 text-brand-600" /> {a.street}, {a.number}</p>
                    {a.is_preferential && <Badge>Preferencial</Badge>}
                  </div>
                  <p className="text-sm text-brand-950/70">{a.complement && `${a.complement} · `}{a.neighborhood}<br />{a.city}/{a.state} · CEP {a.cep}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setMode(a.address_id)}>Editar</Button>
                    {!a.is_preferential && <Button size="sm" variant="ghost" onClick={() => setPreferential.mutate(a.address_id)}><Star className="size-4" /> Tornar preferencial</Button>}
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={async () => { if (await confirm('Excluir este endereço?')) remove.mutate(a.address_id) }}><Trash2 className="size-4" /> Excluir</Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}