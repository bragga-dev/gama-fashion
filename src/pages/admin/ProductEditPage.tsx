import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Package, Pencil, Plus, Power, Star, Trash2, Truck } from 'lucide-react'
import { Card, Modal, PageHeader, Pill, Table, Tabs, td } from '@/components/admin/AdminUI'
import { Button, IconButton } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Alert, PageLoader } from '@/components/ui/misc'
import { useCategories } from '@/hooks/useCatalog'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/lib/errors'
import { COLOR_LABEL, SIZE_ORDER } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { adminProducts } from '@/services/admin.service'
import type { Variant } from '@/types/product'

type Tab = 'dados' | 'variantes' | 'imagens'
const dec = (v: string) => v.replace(',', '.')

function DataTab({ id }: { id: string }) {
  const qc = useQueryClient()
  const { data: p } = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminProducts.get(id) })
  const { data: categories } = useCategories()
  const [form, setForm] = useState<{ name: string; cat: string; gender: string; desc: string } | null>(null)
  const f = form ?? (p ? { name: p.product_name, cat: p.category.product_category_id, gender: p.gender, desc: p.description } : null)
  const save = useMutation({
    mutationFn: () => adminProducts.update(id, { product_name: f!.name, product_category_id: f!.cat, gender: f!.gender, description: f!.desc }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin'] }) },
  })
  if (!f) return <PageLoader />
  const set = (patch: Partial<typeof f>) => setForm({ ...f, ...patch })
  return (
    <Card className="grid gap-4 sm:grid-cols-2">
      <Input className="sm:col-span-2" label="Nome" value={f.name} onChange={(e) => set({ name: e.target.value })} />
      <Select label="Categoria" value={f.cat} onChange={(e) => set({ cat: e.target.value })}>
        {categories?.map((c) => <option key={c.product_category_id} value={c.product_category_id}>{c.category_name}</option>)}</Select>
      <Select label="Gênero" value={f.gender} onChange={(e) => set({ gender: e.target.value })}>
        <option value="feminino">Feminino</option><option value="masculino">Masculino</option><option value="unissex">Unissex</option></Select>
      <Textarea className="sm:col-span-2" label="Descrição" value={f.desc} onChange={(e) => set({ desc: e.target.value })} />
      {save.error && <Alert className="sm:col-span-2">{getErrorMessage(save.error)}</Alert>}
      {save.isSuccess && <Alert tone="success" className="sm:col-span-2">Produto atualizado.</Alert>}
      <div className="sm:col-span-2"><Button loading={save.isPending} onClick={() => save.mutate()}>Salvar alterações</Button></div>
    </Card>
  )
}

function VariantModal({ productId, variant, onClose }: { productId: string; variant: Variant | null; onClose: () => void }) {
  const qc = useQueryClient()
  const [v, setV] = useState({ sku: variant?.sku ?? '', size: variant?.size ?? '', color: variant?.color ?? '', price: variant?.price ?? '', stock: String(variant?.stock ?? 0) })
  const save = useMutation({
    mutationFn: () => {
      const body = { sku: v.sku || null, size: v.size || null, color: v.color || null, price: dec(v.price), stock: Number(v.stock) }
      return variant ? adminProducts.updateVariant(variant.variant_id, body) : adminProducts.createVariant(productId, body)
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin'] }); onClose() },
  })
  return (
    <Modal open title={variant ? 'Editar variante' : 'Nova variante'} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Tamanho" value={v.size} onChange={(e) => setV({ ...v, size: e.target.value })}><option value="">Único</option>{SIZE_ORDER.map((s) => <option key={s}>{s}</option>)}</Select>
        <Select label="Cor" value={v.color} onChange={(e) => setV({ ...v, color: e.target.value })}><option value="">Sem cor</option>{Object.entries(COLOR_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
        <Input label="SKU" value={v.sku} onChange={(e) => setV({ ...v, sku: e.target.value })} />
        <Input label="Preço (R$)" inputMode="decimal" value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} />
        <Input label="Estoque" inputMode="numeric" value={v.stock} onChange={(e) => setV({ ...v, stock: e.target.value })} />
        {!variant && <p className="self-end text-xs text-brand-950/60">Cadastre o frete da variante depois de salvar.</p>}
        {save.error && <Alert className="sm:col-span-2">{getErrorMessage(save.error)}</Alert>}
        <div className="flex gap-2 sm:col-span-2"><Button loading={save.isPending} onClick={() => save.mutate()}>Salvar</Button><Button variant="ghost" onClick={onClose}>Cancelar</Button></div>
      </div>
    </Modal>
  )
}

function ShippingModal({ variant, onClose }: { variant: Variant; onClose: () => void }) {
  const qc = useQueryClient()
  const { data, isLoading, error: loadError } = useQuery({ queryKey: ['admin', 'shipping', variant.variant_id], queryFn: () => adminProducts.getShipping(variant.variant_id), retry: false })
  const exists = !!data
  const [f, setF] = useState<Record<string, string> | null>(null)
  const cur = f ?? { weight: data?.weight ?? '', height: data?.height ?? '', width: data?.width ?? '', length: data?.length ?? '', quantity: String(data?.quantity ?? 1) }
  const save = useMutation({
    mutationFn: () => adminProducts.saveShipping(variant.variant_id, { weight: dec(cur.weight), height: dec(cur.height), width: dec(cur.width), length: dec(cur.length), quantity: Number(cur.quantity) || 1 }, exists),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'shipping'] }); onClose() },
  })
  const field = (k: string, label: string) => <Input label={label} inputMode="decimal" value={cur[k]} onChange={(e) => setF({ ...cur, [k]: e.target.value })} />
  return (
    <Modal open title={`Frete — ${variant.size ?? ''} ${variant.color ? COLOR_LABEL[variant.color] ?? '' : ''}`.trim()} onClose={onClose}>
      {isLoading ? <PageLoader /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {loadError && !exists && <Alert tone="info" className="sm:col-span-2">Esta variante ainda não tem dados de embalagem.</Alert>}
          {field('weight', 'Peso (kg)')}{field('height', 'Altura (cm)')}{field('width', 'Largura (cm)')}{field('length', 'Comprimento (cm)')}{field('quantity', 'Qtd. por embalagem')}
          {save.error && <Alert className="sm:col-span-2">{getErrorMessage(save.error)}</Alert>}
          <div className="flex gap-2 sm:col-span-2"><Button loading={save.isPending} onClick={() => save.mutate()}>Salvar frete</Button><Button variant="ghost" onClick={onClose}>Cancelar</Button></div>
        </div>
      )}
    </Modal>
  )
}

function VariantsTab({ id }: { id: string }) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'variants', id], queryFn: () => adminProducts.variants(id) })
  const [editing, setEditing] = useState<Variant | 'new' | null>(null)
  const [shipping, setShipping] = useState<Variant | null>(null)
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin'] }) }
  const toggle = useMutation({ mutationFn: (v: Variant) => adminProducts.setVariantActive(v.variant_id, !v.is_active), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (vid: string) => adminProducts.deleteVariant(vid), onSuccess: refresh })
  const error = toggle.error ?? remove.error
  if (isLoading) return <PageLoader />
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setEditing('new')}><Plus className="size-4" /> Nova variante</Button></div>
      {error && <Alert>{getErrorMessage(error)}</Alert>}
      <Table head={['Tamanho', 'Cor', 'SKU', 'Preço', 'Estoque', 'Status', '']} empty={data?.length ? undefined : 'Nenhuma variante.'}>
        {data?.map((v) => (
          <tr key={v.variant_id}>
            <td className={td + ' font-bold'}>{v.size ?? '—'}</td><td className={td}>{v.color ? COLOR_LABEL[v.color] ?? v.color : '—'}</td><td className={td}>{v.sku ?? '—'}</td>
            <td className={td}>{formatBRL(v.price)}</td><td className={td}><Pill tone={v.stock > 0 ? 'green' : 'red'}>{v.stock}</Pill></td>
            <td className={td}><Pill tone={v.is_active ? 'green' : 'gray'}>{v.is_active ? 'Ativa' : 'Inativa'}</Pill></td>
            <td className={td}><div className="flex justify-end gap-1">
              <IconButton label="Editar" onClick={() => setEditing(v)}><Pencil className="size-4" /></IconButton>
              <IconButton label="Frete" onClick={() => setShipping(v)}><Truck className="size-4" /></IconButton>
              <IconButton label={v.is_active ? 'Desativar' : 'Ativar'} onClick={() => toggle.mutate(v)}><Power className="size-4" /></IconButton>
              <IconButton label="Excluir" className="text-red-600 hover:bg-red-50" onClick={() => { if (confirm('Excluir esta variante?')) remove.mutate(v.variant_id) }}><Trash2 className="size-4" /></IconButton></div></td>
          </tr>))}
      </Table>
      {editing && <VariantModal productId={id} variant={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {shipping && <ShippingModal variant={shipping} onClose={() => setShipping(null)} />}
    </div>
  )
}

function ImagesTab({ id }: { id: string }) {
  const qc = useQueryClient()
  const { data: p, isLoading } = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminProducts.get(id) })
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin'] }) }
  const upload = useMutation({ mutationFn: async (files: File[]) => { for (const f of files) await adminProducts.uploadImage(id, f, !p?.images.length && f === files[0]) }, onSuccess: refresh })
  const cover = useMutation({ mutationFn: (iid: string) => adminProducts.setCover(iid), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (iid: string) => adminProducts.deleteImage(iid), onSuccess: refresh })
  const error = upload.error ?? cover.error ?? remove.error
  if (isLoading) return <PageLoader />
  return (
    <Card className="space-y-4">
      <input type="file" accept="image/*" multiple disabled={upload.isPending} onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) upload.mutate(fs); e.target.value = '' }}
        className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-5 file:py-2.5 file:font-semibold file:text-brand-800 hover:file:bg-brand-200" />
      {upload.isPending && <p className="text-sm text-brand-950/60">Enviando…</p>}
      {error && <Alert>{getErrorMessage(error)}</Alert>}
      {!p?.images.length ? <p className="text-sm text-brand-950/60">Nenhuma foto cadastrada.</p> : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">{p.images.map((img) => (
          <li key={img.image_id} className={cn('relative aspect-[3/4] overflow-hidden rounded-3xl border-2', img.is_cover ? 'border-brand-700' : 'border-brand-100')}>
            <img src={img.product_image_url} alt="" className="size-full object-cover" />
            {img.is_cover && <span className="absolute left-2 top-2"><Pill>Capa</Pill></span>}
            <div className="absolute inset-x-2 bottom-2 flex justify-between">
              <button aria-label="Definir como capa" title="Definir como capa" onClick={() => cover.mutate(img.image_id)} className="flex size-9 items-center justify-center rounded-full bg-white/95 text-brand-700 shadow-card"><Star className="size-4" /></button>
              <button aria-label="Excluir foto" onClick={() => { if (confirm('Excluir esta foto?')) remove.mutate(img.image_id) }} className="flex size-9 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-card"><Trash2 className="size-4" /></button>
            </div>
          </li>))}</ul>)}
    </Card>
  )
}

export default function ProductEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('dados')
  const { data: p, isLoading } = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminProducts.get(id) })
  const toggle = useMutation({ mutationFn: () => adminProducts.setActive(id, !p!.is_active), onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin'] }) } })
  if (isLoading || !p) return <PageLoader />
  return (
    <>
      <Link to="/painel/produtos" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"><ChevronLeft className="size-4" /> Produtos</Link>
      <PageHeader title={p.product_name} subtitle={p.category.category_name}
        action={<div className="flex items-center gap-2"><Pill tone={p.is_active ? 'green' : 'gray'}>{p.is_active ? 'Ativo' : 'Inativo'}</Pill>
          <Button size="sm" variant="secondary" loading={toggle.isPending} onClick={() => toggle.mutate()}><Power className="size-4" /> {p.is_active ? 'Desativar' : 'Ativar'}</Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/produtos/${id}`)}><Package className="size-4" /> Ver na loja</Button></div>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'dados', label: 'Dados' }, { id: 'variantes', label: 'Variantes e estoque' }, { id: 'imagens', label: 'Fotos' }]} />
      {tab === 'dados' && <DataTab id={id} />}
      {tab === 'variantes' && <VariantsTab id={id} />}
      {tab === 'imagens' && <ImagesTab id={id} />}
    </>
  )
}