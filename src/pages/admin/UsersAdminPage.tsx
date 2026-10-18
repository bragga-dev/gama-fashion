import { useState } from 'react'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Power, Search } from 'lucide-react'
import { PageHeader, Pill, Table, td } from '@/components/admin/AdminUI'
import { IconButton } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Alert, PageLoader, Pagination } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { useDebounce } from '@/hooks/useDebounce'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { adminUsers } from '@/services/admin.service'

export default function UsersAdminPage() {
  const confirm = useConfirm()
  const qc = useQueryClient()
  const { me } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [active, setActive] = useState('')
  const q = useDebounce(search)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { page, q, role, active }], placeholderData: keepPreviousData,
    queryFn: () => adminUsers.list({ page, page_size: 15, search: q, role, is_active: active === '' ? undefined : active === '1' }),
  })
  const toggle = useMutation({ mutationFn: (v: { id: string; active: boolean }) => adminUsers.setActive(v.id, v.active), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'users'] }) } })
  const reset = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1) }

  return (
    <>
      <PageHeader title="Usuários" subtitle={data ? `${data.total} usuários` : undefined} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input aria-label="Buscar" placeholder="Nome ou e-mail" icon={<Search className="size-4" />} value={search} onChange={(e) => reset(setSearch)(e.target.value)} />
        <Select aria-label="Perfil" value={role} onChange={(e) => reset(setRole)(e.target.value)}><option value="">Todos os perfis</option><option value="client">Clientes</option><option value="admin">Administradores</option></Select>
        <Select aria-label="Situação" value={active} onChange={(e) => reset(setActive)(e.target.value)}><option value="">Ativos e inativos</option><option value="1">Ativos</option><option value="0">Inativos</option></Select>
      </div>
      {toggle.error && <Alert className="mb-4">{getErrorMessage(toggle.error)}</Alert>}
      {isLoading ? <PageLoader /> : (
        <div className="space-y-6">
          <Table head={['Usuário', 'Perfil', 'Cadastro', 'Status', '']} empty={data?.items.length ? undefined : 'Nenhum usuário.'}>
            {data?.items.map((u) => (
              <tr key={u.user_id}>
                <td className={td}><div className="flex items-center gap-3">
                  {u.photo_url ? <img src={u.photo_url} alt="" className="size-10 rounded-full object-cover" /> : <span className="flex size-10 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">{(u.display_name ?? u.email)[0].toUpperCase()}</span>}
                  <div><p className="font-semibold">{u.display_name ?? '—'}</p><p className="text-xs text-brand-950/60">{u.email}</p></div></div></td>
                <td className={td}><Pill tone={u.role === 'admin' ? 'brand' : 'gray'}>{u.role_label ?? u.role}</Pill></td>
                <td className={td}>{formatDate(u.date_joined)}</td>
                <td className={td}><Pill tone={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Ativo' : 'Inativo'}</Pill></td>
                <td className={td}>{u.user_id !== me?.user.user_id && (
                  <div className="flex justify-end"><IconButton label={u.is_active ? 'Desativar usuário' : 'Reativar usuário'} onClick={async () => { if (await confirm(u.is_active ? `Desativar ${u.email}?` : `Reativar ${u.email}?`)) toggle.mutate({ id: u.user_id, active: !u.is_active }) }}><Power className="size-4" /></IconButton></div>)}</td>
              </tr>))}
          </Table>
          {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
        </div>)}
    </>
  )
}