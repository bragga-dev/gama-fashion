import { useState } from 'react'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Pencil, Plus, Power, SlidersHorizontal, Star, Trash2, X } from 'lucide-react'
import { Card, Modal, PageHeader, Pill } from '@/components/admin/AdminUI'
import { ImageAdjustModal } from '@/components/admin/ImageAdjustModal'
import { Button, IconButton } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Alert, PageLoader } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { adminCampaigns } from '@/services/admin.service'
import type { Campaign, CampaignImage } from '@/types/campaign'

const toLocal = (iso?: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '')
const toIso = (v: string) => (v ? new Date(v).toISOString() : null)

function CampaignForm({ campaign, onClose }: { campaign: Campaign | null; onClose: () => void }) {
  const qc = useQueryClient()
  const [f, setF] = useState({ title: campaign?.title ?? '', description: campaign?.description ?? '', starts: toLocal(campaign?.starts_at), ends: toLocal(campaign?.ends_at) })
  const [files, setFiles] = useState<File[]>([])
  const [cover, setCover] = useState(0)
  const previews = files.map((file) => URL.createObjectURL(file))
  const save = useMutation({
    mutationFn: async () => {
      const body = { title: f.title.trim(), description: f.description || null, starts_at: toIso(f.starts), ends_at: toIso(f.ends) }
      if (campaign) return adminCampaigns.update(campaign.campaign_id, body)
      const created = await adminCampaigns.create(body)
      for (let i = 0; i < files.length; i++) await adminCampaigns.uploadImage(created.campaign_id, files[i], i === cover)
      return created
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }); void qc.invalidateQueries({ queryKey: ['campaigns'] }); onClose() },
  })
  return (
    <Modal open title={campaign ? 'Editar campanha' : 'Nova campanha'} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input className="sm:col-span-2" label="Título" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <Textarea className="sm:col-span-2" label="Descrição" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <Input label="Início" type="datetime-local" value={f.starts} onChange={(e) => setF({ ...f, starts: e.target.value })} />
        <Input label="Fim" type="datetime-local" value={f.ends} onChange={(e) => setF({ ...f, ends: e.target.value })} />
        {!campaign && (
          <div className="space-y-3 sm:col-span-2">
            <p className="ml-2 text-sm font-medium text-brand-900">Imagens do banner</p>
            <input type="file" accept="image/*" multiple onChange={(e) => { setFiles(Array.from(e.target.files ?? [])); setCover(0) }}
              className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-5 file:py-2.5 file:font-semibold file:text-brand-800 hover:file:bg-brand-200" />
            <p className="ml-2 text-xs text-brand-950/60">Use imagens em paisagem (ideal 2560×1080). A estrela marca a capa (1º slide).</p>
            {files.length > 0 && (
              <ul className="flex flex-wrap gap-3">{previews.map((src, i) => (
                <li key={src} className={cn('relative aspect-video w-32 overflow-hidden rounded-2xl border-2', i === cover ? 'border-brand-700' : 'border-brand-100')}>
                  <img src={src} alt="" className="size-full object-cover" />
                  <button type="button" aria-label="Definir como capa" onClick={() => setCover(i)} className={cn('absolute left-1 top-1 flex size-7 items-center justify-center rounded-full', i === cover ? 'bg-brand-700 text-white' : 'bg-white/90 text-brand-700')}><Star className="size-3.5" /></button>
                  <button type="button" aria-label="Remover" onClick={() => { setFiles(files.filter((_, n) => n !== i)); setCover(0) }} className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-white/90 text-red-600"><X className="size-3.5" /></button>
                </li>))}</ul>)}
          </div>
        )}
        {save.error && <Alert className="sm:col-span-2">{getErrorMessage(save.error)}</Alert>}
        <div className="flex gap-2 sm:col-span-2"><Button disabled={f.title.trim().length < 2} loading={save.isPending} onClick={() => save.mutate()}>Salvar</Button><Button variant="ghost" onClick={onClose}>Cancelar</Button></div>
      </div>
    </Modal>
  )
}

function ImagesModal({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const qc = useQueryClient()
  const id = campaign.campaign_id
  const [adjusting, setAdjusting] = useState<CampaignImage | null>(null)
  const confirm = useConfirm()
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'campaign-images', id], queryFn: () => adminCampaigns.images(id) })
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin', 'campaign-images', id] }); void qc.invalidateQueries({ queryKey: ['campaigns'] }) }
  const upload = useMutation({ mutationFn: async (files: File[]) => { for (const f of files) await adminCampaigns.uploadImage(id, f, !data?.length && f === files[0]) }, onSuccess: refresh })
  const cover = useMutation({ mutationFn: (iid: string) => adminCampaigns.setCover(iid), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (iid: string) => adminCampaigns.deleteImage(iid), onSuccess: refresh })
  const error = upload.error ?? cover.error ?? remove.error
  return (
    <Modal open wide title={`Imagens — ${campaign.title}`} onClose={onClose}>
      <div className="space-y-4">
        <input type="file" accept="image/*" multiple disabled={upload.isPending} onChange={(e) => { const fs = Array.from(e.target.files ?? []); if (fs.length) upload.mutate(fs); e.target.value = '' }}
          className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-5 file:py-2.5 file:font-semibold file:text-brand-800 hover:file:bg-brand-200" />
        {error && <Alert>{getErrorMessage(error)}</Alert>}
        {isLoading ? <PageLoader /> : !data?.length ? <p className="text-sm text-brand-950/60">Nenhuma imagem.</p> : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">{data.map((img) => (
            <li key={img.campaign_mage_id} className={cn('relative aspect-video overflow-hidden rounded-3xl border-2', img.is_cover ? 'border-brand-700' : 'border-brand-100')}>
              <img src={img.image_url} alt="" className="size-full object-cover" />
              {img.is_cover && <span className="absolute left-2 top-2"><Pill>Capa</Pill></span>}
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button aria-label="Definir como capa" title="Definir como capa" onClick={() => cover.mutate(img.campaign_mage_id)} className="flex size-9 items-center justify-center rounded-full bg-white/95 text-brand-700 shadow-card"><Star className="size-4" /></button>
                  <button aria-label="Ajustar zoom e posição" title="Ajustar zoom e posição" onClick={() => setAdjusting(img)} className="flex size-9 items-center justify-center rounded-full bg-white/95 text-brand-700 shadow-card"><SlidersHorizontal className="size-4" /></button>
                </div>
                <button aria-label="Excluir" onClick={async () => { if (await confirm('Excluir esta imagem?')) remove.mutate(img.campaign_mage_id) }} className="flex size-9 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-card"><Trash2 className="size-4" /></button>
              </div>
            </li>))}</ul>)}
        {adjusting && <ImageAdjustModal image={adjusting} onClose={() => setAdjusting(null)} />}
      </div>
    </Modal>
  )
}

export default function CampaignsAdminPage() {
  const confirm = useConfirm()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'campaigns'], queryFn: adminCampaigns.list })
  const [form, setForm] = useState<Campaign | 'new' | null>(null)
  const [images, setImages] = useState<Campaign | null>(null)
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }); void qc.invalidateQueries({ queryKey: ['campaigns'] }) }
  const toggle = useMutation({ mutationFn: (c: Campaign) => adminCampaigns.setActive(c.campaign_id, !c.is_active), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (id: string) => adminCampaigns.remove(id), onSuccess: refresh })
  const error = toggle.error ?? remove.error
  if (isLoading) return <PageLoader />
  return (
    <>
      <PageHeader title="Campanhas" subtitle="Banners do topo da home" action={<Button onClick={() => setForm('new')}><Plus className="size-4" /> Nova campanha</Button>} />
      {error && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}
      {!data?.length ? <Card><p className="text-center text-sm text-brand-950/60">Nenhuma campanha.</p></Card> : (
        <ul className="grid gap-4 lg:grid-cols-2">{data.map((c) => (
          <li key={c.campaign_id}><Card className="space-y-3">
            <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{c.title}</p>
              <p className="text-xs text-brand-950/60">{c.starts_at ? formatDate(c.starts_at, true) : 'Sem início'} → {c.ends_at ? formatDate(c.ends_at, true) : 'Sem fim'}</p></div>
              <Pill tone={c.is_active ? 'green' : 'gray'}>{c.is_active ? 'Ativa' : 'Inativa'}</Pill></div>
            {c.description && <p className="line-clamp-2 text-sm text-brand-950/70">{c.description}</p>}
            <div className="flex gap-1">
              <IconButton label="Imagens" onClick={() => setImages(c)}><ImageIcon className="size-4" /></IconButton>
              <IconButton label="Editar" onClick={() => setForm(c)}><Pencil className="size-4" /></IconButton>
              <IconButton label={c.is_active ? 'Desativar' : 'Ativar'} onClick={() => toggle.mutate(c)}><Power className="size-4" /></IconButton>
              <IconButton label="Excluir" className="text-red-600 hover:bg-red-50" onClick={async () => { if (await confirm(`Excluir "${c.title}"?`)) remove.mutate(c.campaign_id) }}><Trash2 className="size-4" /></IconButton>
            </div></Card></li>))}</ul>)}
      {form && <CampaignForm campaign={form === 'new' ? null : form} onClose={() => setForm(null)} />}
      {images && <ImagesModal campaign={images} onClose={() => setImages(null)} />}
    </>
  )
}