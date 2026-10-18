import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera, Pencil, Plus, Power, Shirt, Trash2 } from 'lucide-react'
import { Modal, PageHeader, Pill, Table, td } from '@/components/admin/AdminUI'
import { Button, IconButton } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert, PageLoader } from '@/components/ui/misc'
import { getErrorMessage } from '@/lib/errors'
import { adminCategories } from '@/services/admin.service'
import type { Category } from '@/types/product'

export default function CategoriesAdminPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminCategories.list })
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageFor, setImageFor] = useState<string | null>(null)
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); void qc.invalidateQueries({ queryKey: ['categories'] }) }

  const save = useMutation({
    mutationFn: () => editing === 'new' ? adminCategories.create(name.trim()) : adminCategories.update((editing as Category).product_category_id, { category_name: name.trim() }),
    onSuccess: () => { refresh(); setEditing(null) },
  })
  const toggle = useMutation({ mutationFn: (c: Category) => adminCategories.update(c.product_category_id, { is_active: !c.is_active }), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (id: string) => adminCategories.remove(id), onSuccess: refresh })
  const image = useMutation({ mutationFn: (v: { id: string; file: File }) => adminCategories.uploadImage(v.id, v.file), onSuccess: refresh })
  const rmImage = useMutation({ mutationFn: (id: string) => adminCategories.removeImage(id), onSuccess: refresh })
  const error = toggle.error ?? remove.error ?? image.error ?? rmImage.error

  if (isLoading) return <PageLoader />
  return (
    <>
      <PageHeader title="Categorias" action={<Button onClick={() => { setName(''); setEditing('new') }}><Plus className="size-4" /> Nova categoria</Button>} />
      {error && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f && imageFor) image.mutate({ id: imageFor, file: f }); e.target.value = '' }} />
      <Table head={['Imagem', 'Nome', 'Status', '']} empty={data?.length ? undefined : 'Nenhuma categoria.'}>
        {data?.map((c) => (
          <tr key={c.product_category_id}>
            <td className={td}><span className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-brand-50">{c.category_image_url ? <img src={c.category_image_url} alt="" className="size-full object-cover" /> : <Shirt className="size-5 text-brand-300" />}</span></td>
            <td className={td + ' font-semibold'}>{c.category_name}</td>
            <td className={td}><Pill tone={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Ativa' : 'Inativa'}</Pill></td>
            <td className={td}><div className="flex justify-end gap-1">
              <IconButton label="Alterar imagem" onClick={() => { setImageFor(c.product_category_id); fileRef.current?.click() }}><Camera className="size-4" /></IconButton>
              {c.category_image_url && <IconButton label="Remover imagem" onClick={() => rmImage.mutate(c.product_category_id)}><Trash2 className="size-4 text-brand-400" /></IconButton>}
              <IconButton label="Renomear" onClick={() => { setName(c.category_name); setEditing(c) }}><Pencil className="size-4" /></IconButton>
              <IconButton label={c.is_active ? 'Desativar' : 'Ativar'} onClick={() => toggle.mutate(c)}><Power className="size-4" /></IconButton>
              <IconButton label="Excluir" className="text-red-600 hover:bg-red-50" onClick={() => { if (confirm(`Excluir "${c.category_name}"? Só é possível sem produtos vinculados.`)) remove.mutate(c.product_category_id) }}><Trash2 className="size-4" /></IconButton></div></td>
          </tr>))}
      </Table>
      <Modal open={!!editing} title={editing === 'new' ? 'Nova categoria' : 'Renomear categoria'} onClose={() => setEditing(null)}>
        <div className="space-y-4">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          {save.error && <Alert>{getErrorMessage(save.error)}</Alert>}
          <div className="flex gap-2"><Button disabled={!name.trim()} loading={save.isPending} onClick={() => save.mutate()}>Salvar</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button></div>
        </div>
      </Modal>
    </>
  )
}
