import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Trash2 } from 'lucide-react'
import { Card, PageHeader, Pill } from '@/components/admin/AdminUI'
import { IconButton } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Alert, PageLoader, Pagination } from '@/components/ui/misc'
import { useDebounce } from '@/hooks/useDebounce'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { adminContacts } from '@/services/admin.service'
import type { ContactStatus } from '@/types/admin'

const TONE = { pending: 'amber', in_progress: 'blue', resolved: 'green', archived: 'gray' } as const

export default function ContactsAdminPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const q = useDebounce(search)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contacts', { page, status, q }], placeholderData: keepPreviousData,
    queryFn: () => adminContacts.list({ page, page_size: 10, status: (status || undefined) as ContactStatus | undefined, search: q }),
  })
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin', 'contacts'] }) }
  const setStat = useMutation({ mutationFn: (v: { id: string; s: ContactStatus }) => adminContacts.setStatus(v.id, v.s), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (id: string) => adminContacts.remove(id), onSuccess: refresh })
  const error = setStat.error ?? remove.error

  return (
    <>
      <PageHeader title="Mensagens" subtitle="Contatos enviados pelo formulário da loja" />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input aria-label="Buscar" placeholder="Buscar" icon={<Search className="size-4" />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="sm:col-span-2" />
        <Select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">Todos</option><option value="pending">Pendentes</option><option value="in_progress">Em andamento</option><option value="resolved">Resolvidas</option><option value="archived">Arquivadas</option></Select>
      </div>
      {error && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}
      {isLoading ? <PageLoader /> : (
        <div className="space-y-6">
          {!data?.items.length ? <Card><p className="text-center text-sm text-brand-950/60">Nenhuma mensagem.</p></Card> : (
            <ul className="space-y-3">{data.items.map((c) => (
              <li key={c.contact_id}><Card className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="font-bold">{c.subject}</p>
                    <p className="text-sm text-brand-950/70">{c.full_name} · <a className="text-brand-700 hover:underline" href={`mailto:${c.email}`}>{c.email}</a> · {c.phone}</p></div>
                  <Pill tone={TONE[c.status]}>{c.status_label}</Pill>
                </div>
                <p className="whitespace-pre-line text-sm">{c.message}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-brand-950/50">{formatDate(c.created_at, true)}</span>
                  <div className="flex items-center gap-2">
                    <Select aria-label="Alterar status" value={c.status} onChange={(e) => setStat.mutate({ id: c.contact_id, s: e.target.value as ContactStatus })}>
                      <option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="resolved">Resolvida</option><option value="archived">Arquivada</option></Select>
                    <IconButton label="Excluir" className="text-red-600 hover:bg-red-50" onClick={() => { if (confirm('Excluir esta mensagem?')) remove.mutate(c.contact_id) }}><Trash2 className="size-4" /></IconButton>
                  </div>
                </div>
              </Card></li>))}</ul>)}
          {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
        </div>)}
    </>
  )
}