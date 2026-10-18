import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { CategoryBubbles } from '@/components/home/CategoryBubbles'
import { BenefitsStrip } from '@/components/home/BenefitsStrip'
import { ProductGrid } from '@/components/product/ProductCard'
import { ButtonLink } from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/misc'
import { useProducts } from '@/hooks/useCatalog'

function Shelf({ title, subtitle, filters, to }: { title: string; subtitle?: string; filters: Parameters<typeof useProducts>[0]; to: string }) {
  const { data, isLoading, isError } = useProducts(filters)
  if (isError || (!isLoading && !data?.items.length)) return null
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <SectionTitle title={title} subtitle={subtitle}
        action={<Link to={to} className="hidden items-center gap-1 rounded-full bg-brand-50 px-5 py-2 text-sm font-semibold text-brand-800 transition hover:bg-brand-100 sm:flex">Ver tudo <ArrowRight className="size-4" /></Link>} />
      <ProductGrid products={data?.items} loading={isLoading} count={4} />
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <CategoryBubbles />
      <BenefitsStrip />
      <Shelf title="Novidades" subtitle="Acabaram de chegar" to="/produtos?sort=recent" filters={{ sort: 'recent', page_size: 8, in_stock_only: true }} />

      <section className="mx-auto max-w-7xl px-4 pt-14">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { to: '/produtos?gender=feminino', title: 'Feminino', text: 'Leggings, tops, conjuntos e mais', tone: 'from-brand-600 to-brand-800' },
            { to: '/produtos?gender=masculino', title: 'Masculino', text: 'Camisetas, shorts e performance', tone: 'from-brand-900 to-brand-950' },
          ].map((b) => (
            <Link key={b.to} to={b.to} className={`group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${b.tone} p-8 text-white`}>
              <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 transition duration-500 group-hover:scale-125" />
              <h3 className="text-3xl font-extrabold">{b.title}</h3>
              <p className="mt-1 text-sm text-brand-100">{b.text}</p>
              <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-800 transition group-hover:gap-3">Comprar <ArrowRight className="size-4" /></span>
            </Link>
          ))}
        </div>
      </section>

      <Shelf title="Feminino" to="/produtos?gender=feminino" filters={{ gender: 'feminino', page_size: 4 }} />
      <Shelf title="Masculino" to="/produtos?gender=masculino" filters={{ gender: 'masculino', page_size: 4 }} />

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="flex flex-col items-center gap-4 rounded-[2.5rem] bg-brand-50 px-6 py-12 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Ficou com alguma dúvida?</h2>
          <p className="max-w-md text-sm text-brand-950/70">Nossa equipe ajuda você a escolher tamanho, cor e a melhor forma de pagamento.</p>
          <ButtonLink to="/contato" size="lg">Fale conosco</ButtonLink>
        </div>
      </section>
    </>
  )
}
