import { useRef, useState, type PointerEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Move, RotateCcw } from 'lucide-react'
import { BannerImage } from '@/components/home/BannerImage'
import { Modal } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/misc'
import { cn } from '@/lib/cn'
import { getErrorMessage } from '@/lib/errors'
import { adjustOf, DEFAULT_ADJUST, type ImageAdjust } from '@/lib/image-fit'
import { adminCampaigns } from '@/services/admin.service'
import type { CampaignImage } from '@/types/campaign'

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v))

function Preview({ src, adjust, ratio, label, onMove }: { src: string; adjust: ImageAdjust; ratio: string; label: string; onMove: (x: number, y: number) => void }) {
  const drag = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null)
  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, fx: adjust.focus_x, fy: adjust.focus_y }
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const r = e.currentTarget.getBoundingClientRect()
    // Arrastar a imagem para a direita revela a esquerda: o foco anda no sentido oposto.
    onMove(clamp(drag.current.fx - ((e.clientX - drag.current.x) / r.width) * 100), clamp(drag.current.fy - ((e.clientY - drag.current.y) / r.height) * 100))
  }
  return (
    <div className="space-y-1.5">
      <p className="ml-2 flex items-center gap-1 text-xs font-semibold text-brand-950/60"><Move className="size-3" /> {label} — arraste para reposicionar</p>
      <div onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null }} onPointerCancel={() => { drag.current = null }}
        className={cn('relative w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-brand-950 active:cursor-grabbing', ratio)}>
        <BannerImage src={src} adjust={adjust} eager />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-950/70 via-brand-950/30 to-transparent" />
      </div>
    </div>
  )
}

export function ImageAdjustModal({ image, onClose }: { image: CampaignImage; onClose: () => void }) {
  const qc = useQueryClient()
  const [a, setA] = useState<ImageAdjust>(adjustOf(image))
  const set = (patch: Partial<ImageAdjust>) => setA((cur) => ({ ...cur, ...patch }))

  const save = useMutation({
    mutationFn: async () => {
      const res = await adminCampaigns.updateImage(image.campaign_mage_id, { fit: a.fit, focus_x: Math.round(a.focus_x), focus_y: Math.round(a.focus_y), zoom: Number(a.zoom.toFixed(2)) })
      if (res.fit === undefined) throw new Error('O back ainda não tem os campos de ajuste (fit, focus_x, focus_y, zoom). Aplique o patch do back e tente de novo.')
      return res
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'campaign-images', image.campaign_id] })
      void qc.invalidateQueries({ queryKey: ['campaigns'] })
      onClose()
    },
  })

  const seg = (active: boolean) => cn('flex-1 rounded-full px-4 py-2 text-sm font-semibold transition', active ? 'bg-brand-700 text-white' : 'bg-brand-50 text-brand-800 hover:bg-brand-100')
  const range = 'w-full accent-brand-700'

  return (
    <Modal open wide title="Ajustar imagem do banner" onClose={onClose}>
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Preview src={image.image_url} adjust={a} ratio="aspect-[21/9]" label="Desktop (21:9)" onMove={(x, y) => set({ focus_x: x, focus_y: y })} />
          <Preview src={image.image_url} adjust={a} ratio="aspect-[4/3]" label="Celular (4:3)" onMove={(x, y) => set({ focus_x: x, focus_y: y })} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="ml-2 text-sm font-medium">Ajuste da imagem</p>
            <div className="flex gap-2 rounded-full bg-brand-50 p-1">
              <button type="button" className={seg(a.fit === 'cover')} onClick={() => set({ fit: 'cover' })}>Preencher</button>
              <button type="button" className={seg(a.fit === 'contain')} onClick={() => set({ fit: 'contain', zoom: 1 })}>Mostrar inteira</button>
            </div>
            <p className="ml-2 text-xs text-brand-950/60">{a.fit === 'cover' ? 'Preenche todo o banner e corta as bordas.' : 'Mostra a foto inteira, com as laterais desfocadas.'}</p>
          </div>

          <label className="block space-y-2">
            <span className="ml-2 flex justify-between text-sm font-medium"><span>Zoom</span><span className="text-brand-700">{Math.round(a.zoom * 100)}%</span></span>
            <input type="range" min={1} max={3} step={0.05} value={a.zoom} onChange={(e) => set({ zoom: Number(e.target.value) })} className={range} />
          </label>

          <label className="block space-y-2">
            <span className="ml-2 flex justify-between text-sm font-medium"><span>Posição horizontal</span><span className="text-brand-700">{Math.round(a.focus_x)}%</span></span>
            <input type="range" min={0} max={100} value={a.focus_x} onChange={(e) => set({ focus_x: Number(e.target.value) })} className={range} />
          </label>
          <label className="block space-y-2">
            <span className="ml-2 flex justify-between text-sm font-medium"><span>Posição vertical</span><span className="text-brand-700">{Math.round(a.focus_y)}%</span></span>
            <input type="range" min={0} max={100} value={a.focus_y} onChange={(e) => set({ focus_y: Number(e.target.value) })} className={range} />
          </label>
        </div>

        {save.error && <Alert>{getErrorMessage(save.error)}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button loading={save.isPending} onClick={() => save.mutate()}>Salvar ajuste</Button>
          <Button variant="secondary" onClick={() => setA(DEFAULT_ADJUST)}><RotateCcw className="size-4" /> Restaurar</Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  )
}