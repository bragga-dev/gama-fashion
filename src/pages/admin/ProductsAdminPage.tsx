import { useState } from 'react'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { Link } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageOff, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react'
import { PageHeader, Pill, Table, td } from '@/components/admin/AdminUI'
import { ButtonLink, IconButton } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Alert, PageLoader, Pagination } from '@/components/ui/misc'
import { useCategories } from '@/hooks/useCatalog'
import { useDebounce } from '@/hooks/useDebounce'
import { getErrorMessage } from '@/lib/errors'
import { GENDER_LABEL } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { adminProducts } from '@/services/admin.service'

export default function ProductsAdminPage() {
  const confirm = useConfirm()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [gender, setGender] = useState('')
  const [state, setState] = useState('')
  const q = useDebounce(search)
  const { data: categories } = useCategories()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', { page, q, category, gender, state }],
    placeholderData: keepPreviousData,
    queryFn: () => adminProducts.list({ page, page_size: 15, search: q, product_category_id: category, gender, active_only: state === 'active' ? true : undefined, in_stock_only: state === 'stock' ? true : undefined }),
  })
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin', 'products'] }) }
  const toggle = useMutation({ mutationFn: (v: { id: string; active: boolean }) => adminProducts.setActive(v.id, v.active), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (id: string) => adminProducts.remove(id), onSuccess: refresh })
  const error = toggle.error ?? remove.error
  const reset = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1) }

  return (
    <>
      <PageHeader title="Produtos" subtitle={data ? `${data.total} produtos` : undefined} action={<ButtonLink to="/painel/produtos/novo"><Plus className="size-4" /> Novo produto</ButtonLink>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input aria-label="Buscar" placeholder="Buscar produto" icon={<Search className="size-4" />} value={search} onChange={(e) => reset(setSearch)(e.target.value)} />
        <Select aria-label="Categoria" value={category} onChange={(e) => reset(setCategory)(e.target.value)}>
          <option value="">Todas as categorias</option>{categories?.map((c) => <option key={c.product_category_id} value={c.product_category_id}>{c.category_name}</option>)}
        </Select>
        <Select aria-label="Gênero" value={gender} onChange={(e) => reset(setGender)(e.target.value)}>
          <option value="">Todos os gêneros</option><option value="feminino">Feminino</option><option value="masculino">Masculino</option><option value="unissex">Unissex</option>
        </Select>
        <Select aria-label="Situação" value={state} onChange={(e) => reset(setState)(e.target.value)}>
          <option value="">Ativos e inativos</option><option value="active">Somente ativos</option><option value="stock">Somente com estoque</option>
        </Select>
      </div>
      {error && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}
      {isLoading ? <PageLoader /> : (
        <div className="space-y-6">
          <Table head={['Produto', 'Categoria', 'Gênero', 'Preço', 'Variantes', 'Status', '']} empty={data?.items.length ? undefined : 'Nenhum produto encontrado.'}>
            {data?.items.map((p) => (
              <tr key={p.product_id} className="hover:bg-brand-50/60">
                <td className={td}><div className="flex items-center gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50">
                    {p.cover_image ? <img src={p.cover_image.product_image_url} alt="" className="size-full object-cover" /> : <ImageOff className="size-5 text-brand-300" />}</span>
                  <Link to={`/painel/produtos/${p.product_id}`} className="font-semibold hover:text-brand-700">{p.product_name}</Link></div></td>
                <td className={td}>{p.category.category_name}</td>
                <td className={td}>{GENDER_LABEL[p.gender] ?? p.gender}</td>
                <td className={td}>{p.min_price ? (p.min_price === p.max_price ? formatBRL(p.min_price) : `${formatBRL(p.min_price)} – ${formatBRL(p.max_price)}`) : '—'}</td>
                <td className={td}>{p.variants.length} {p.in_stock ? '' : <Pill tone="red">Sem estoque</Pill>}</td>
                <td className={td}><Pill tone={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Ativo' : 'Inativo'}</Pill></td>
                <td className={td}><div className="flex justify-end gap-1">
                  <Link to={`/painel/produtos/${p.product_id}`} aria-label="Editar" className="flex size-10 items-center justify-center rounded-full hover:bg-brand-100"><Pencil className="size-4" /></Link>
                  <IconButton label={p.is_active ? 'Desativar' : 'Ativar'} onClick={() => toggle.mutate({ id: p.product_id, active: !p.is_active })}><Power className="size-4" /></IconButton>
                  <IconButton label="Excluir" className="text-red-600 hover:bg-red-50" onClick={async () => { if (await confirm(`Excluir "${p.product_name}"? Esta ação não pode ser desfeita.`)) remove.mutate(p.product_id) }}><Trash2 className="size-4" /></IconButton></div></td>
              </tr>))}
          </Table>
          {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
        </div>
      )}
    </>
  )
}