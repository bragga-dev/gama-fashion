import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/Button'
import { useRunningCampaigns } from '@/hooks/useCatalog'
import { cn } from '@/lib/cn'

/** Banner principal: usa as campanhas em andamento; sem campanha, mostra o banner institucional. */
export function HeroCarousel() {
  const { data: campaigns } = useRunningCampaigns()
  const slides = (campaigns ?? [])
    .map((c) => {
      const imgs = [...c.images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.display_order - b.display_order)
      return { id: c.campaign_id, title: c.title, text: c.description, image: imgs[0]?.image_url }
    })
  const fallback = !slides.length
  const total = fallback ? 1 : slides.length
  const [i, setI] = useState(0)

  useEffect(() => {
    if (total < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % total), 6000)
    return () => clearInterval(t)
  }, [total])

  const slide = fallback
    ? { id: 'default', title: 'Treine com estilo. Vá além.', text: 'Moda fitness feminina e masculina pensada para acompanhar o seu ritmo.', image: undefined }
    : slides[i % slides.length]

  return (
    <section aria-label="Destaques" className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 text-white">
        {slide.image && <img src={slide.image} alt="" className="absolute inset-0 size-full object-cover opacity-45" />}
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/10 blur-3xl" />
        <div key={slide.id} className="animate-fade relative flex min-h-[22rem] max-w-2xl flex-col justify-center gap-5 p-8 sm:min-h-[28rem] sm:p-14">
          <span className="w-fit rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">Gama Fashion</span>
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">{slide.title}</h1>
          {slide.text && <p className="max-w-lg text-base text-brand-100 sm:text-lg">{slide.text}</p>}
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink to="/produtos?sort=recent" variant="white" size="lg">Ver novidades</ButtonLink>
            <ButtonLink to="/produtos" size="lg" className="border-2 border-white/60 bg-transparent text-white shadow-none hover:bg-white/10">Todos os produtos</ButtonLink>
          </div>
        </div>
        {total > 1 && (
          <>
            <div className="absolute bottom-5 right-6 flex items-center gap-2">
              <IconButton label="Anterior" className="bg-white/15 text-white hover:bg-white/25" onClick={() => setI((i - 1 + total) % total)}><ChevronLeft className="size-5" /></IconButton>
              <IconButton label="Próximo" className="bg-white/15 text-white hover:bg-white/25" onClick={() => setI((i + 1) % total)}><ChevronRight className="size-5" /></IconButton>
            </div>
            <div className="absolute bottom-7 left-8 flex gap-2 sm:left-14">
              {slides.map((s, n) => <button key={s.id} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} className={cn('h-2 rounded-full transition-all', n === i ? 'w-8 bg-white' : 'w-2 bg-white/50')} />)}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
