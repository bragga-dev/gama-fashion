import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ButtonLink, IconButton } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/misc'
import { useRunningCampaigns } from '@/hooks/useCatalog'
import { BannerImage } from './BannerImage'
import { cn } from '@/lib/cn'
import { adjustOf, DEFAULT_ADJUST, type ImageAdjust } from '@/lib/image-fit'

interface Slide { id: string; title: string; text?: string | null; image?: string; adjust: ImageAdjust }

const FALLBACK: Slide = {
  id: 'default',
  adjust: DEFAULT_ADJUST,
  title: 'Treine com estilo. Vá além.',
  text: 'Moda fitness feminina e masculina pensada para acompanhar o seu ritmo.',
}
const AUTOPLAY_MS = 6000
const SWIPE_PX = 50

/** Carrossel da home: cada imagem de cada campanha ativa vira um slide. */
export function HeroCarousel() {
  const { data: campaigns, isLoading } = useRunningCampaigns()

  const slides: Slide[] = (campaigns ?? []).flatMap((c) =>
    [...c.images]
      .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.display_order - b.display_order)
      .map((img) => ({ id: img.campaign_mage_id, title: c.title, text: c.description, image: img.image_url, adjust: adjustOf(img) })),
  )
  const list = slides.length ? slides : [FALLBACK]
  const total = list.length

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragX, setDragX] = useState(0)
  const startX = useRef<number | null>(null)
  const current = Math.min(index, total - 1)

  const go = useCallback((n: number) => setIndex(((n % total) + total) % total), [total])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (total < 2 || paused || reduced) return
    const t = setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [total, paused, current])

  const onDown = (e: PointerEvent) => { startX.current = e.clientX; setPaused(true) }
  const onMove = (e: PointerEvent) => { if (startX.current !== null) setDragX(e.clientX - startX.current) }
  const onUp = () => {
    if (startX.current === null) return
    if (dragX <= -SWIPE_PX) go(current + 1)
    else if (dragX >= SWIPE_PX) go(current - 1)
    startX.current = null
    setDragX(0)
    setPaused(false)
  }

  if (isLoading) return <Skeleton className="aspect-[4/3] w-full rounded-none sm:aspect-[16/9] lg:aspect-[21/9]" />

  return (
    <section aria-roledescription="carrossel" aria-label="Destaques" className="w-full">
      <div
        className="relative w-full overflow-hidden bg-brand-950 text-white"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(current - 1); if (e.key === 'ArrowRight') go(current + 1) }}
      >
        <div
          className={cn('flex touch-pan-y select-none', startX.current === null && 'transition-transform duration-700 ease-out')}
          style={{ transform: `translateX(calc(${-current * 100}% + ${dragX}px))` }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}
        >
          {list.map((s, i) => (
            <div key={s.id} role="group" aria-roledescription="slide" aria-label={`${i + 1} de ${total}`} aria-hidden={i !== current}
              className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 sm:aspect-[16/9] lg:aspect-[21/9]">
              {s.image && <BannerImage src={s.image} adjust={s.adjust} eager={i === 0} />}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-950/40 to-transparent" />
              {!s.image && <div className="absolute -right-20 -top-20 size-80 rounded-full bg-brand-500/30 blur-3xl" />}
              <div className="absolute inset-0">
                <div className="mx-auto flex h-full max-w-7xl flex-col justify-center gap-3 px-6 sm:gap-5 sm:px-12">
                  <span className="w-fit rounded-full bg-white/15 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur sm:text-xs">Gama Fashion</span>
                  <h2 className="max-w-2xl text-3xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">{s.title}</h2>
                  {s.text && <p className="hidden max-w-lg line-clamp-2 text-base text-brand-100 sm:block lg:text-lg">{s.text}</p>}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <ButtonLink to="/produtos?sort=recent" variant="white" tabIndex={i === current ? 0 : -1}>Ver novidades</ButtonLink>
                    <ButtonLink to="/produtos" tabIndex={i === current ? 0 : -1} className="hidden border-2 border-white/60 bg-transparent text-white shadow-none hover:bg-white/10 sm:inline-flex">Todos os produtos</ButtonLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <IconButton label="Slide anterior" onClick={() => go(current - 1)} className="absolute left-4 top-1/2 hidden -translate-y-1/2 bg-white/20 text-white backdrop-blur hover:bg-white/35 sm:flex"><ChevronLeft className="size-6" /></IconButton>
            <IconButton label="Próximo slide" onClick={() => go(current + 1)} className="absolute right-4 top-1/2 hidden -translate-y-1/2 bg-white/20 text-white backdrop-blur hover:bg-white/35 sm:flex"><ChevronRight className="size-6" /></IconButton>
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2" role="tablist" aria-label="Escolher slide">
              {list.map((s, n) => (
                <button key={s.id} role="tab" aria-selected={n === current} aria-label={`Ir para o slide ${n + 1}`} onClick={() => go(n)}
                  className={cn('h-2.5 rounded-full transition-all', n === current ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80')} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}