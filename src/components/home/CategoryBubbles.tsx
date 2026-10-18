import { Link } from 'react-router-dom'
import { Shirt } from 'lucide-react'
import { useCategories } from '@/hooks/useCatalog'
import { Skeleton } from '@/components/ui/misc'

export function CategoryBubbles() {
  const { data, isLoading } = useCategories()
  if (!isLoading && !data?.length) return null
  return (
    <section aria-label="Categorias" className="mx-auto max-w-7xl px-4 pt-10">
      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none sm:justify-center">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="size-24 shrink-0 rounded-full sm:size-28" />)
          : data!.map((c) => (
            <Link key={c.product_category_id} to={`/produtos?category=${c.product_category_id}`} className="group flex w-24 shrink-0 flex-col items-center gap-2 sm:w-28">
              <span className="flex size-24 items-center justify-center overflow-hidden rounded-full border-[3px] border-brand-200 bg-brand-50 transition group-hover:border-brand-600 group-hover:shadow-soft sm:size-28">
                {c.category_image_url
                  ? <img src={c.category_image_url} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-110" />
                  : <Shirt className="size-8 text-brand-400" />}
              </span>
              <span className="text-center text-xs font-bold sm:text-sm">{c.category_name}</span>
            </Link>
          ))}
      </div>
    </section>
  )
}
