import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import { formatBRL, installment } from '@/lib/money'
import { COLOR_HEX, sortSizes } from '@/lib/format'
import type { ProductListItem } from '@/types/product'
import { Badge, Skeleton } from '@/components/ui/misc'

export function ProductCard({ product }: { product: ProductListItem }) {
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[]
  const sizes = sortSizes([...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[])
  const hasRange = product.min_price && product.max_price && product.min_price !== product.max_price

  return (
    <Link to={`/produtos/${product.product_id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-brand-50">
        {product.cover_image?.product_image_url
          ? <img src={product.cover_image.product_image_url} alt={product.product_name} loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-105" />
          : <div className="flex size-full items-center justify-center text-brand-300"><ImageOff className="size-10" /></div>}
        {!product.in_stock && <Badge className="absolute left-3 top-3 bg-brand-950 text-white">Esgotado</Badge>}
        {sizes.length > 0 && (
          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 flex-wrap justify-center gap-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {sizes.slice(0, 6).map((s) => <span key={s} className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold shadow-card">{s}</span>)}
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-600">{product.category.category_name}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.product_name}</h3>
        {product.min_price && (
          <p className="text-base font-extrabold">
            {hasRange && <span className="mr-1 text-xs font-medium text-brand-950/60">a partir de</span>}
            {formatBRL(product.min_price)}
          </p>
        )}
        {product.min_price && <p className="text-xs text-brand-950/60">ou 3x de {installment(product.min_price)} sem juros</p>}
        {colors.length > 0 && (
          <div className="flex gap-1.5 pt-1">
            {colors.slice(0, 6).map((c) => (
              <span key={c} title={c} className="size-4 rounded-full border border-brand-200" style={{ backgroundColor: COLOR_HEX[c] ?? '#ccc' }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] rounded-[1.75rem]" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-5 w-1/2" />
    </div>
  )
}

export function ProductGrid({ products, loading, count = 8 }: { products?: ProductListItem[]; loading?: boolean; count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
      {loading
        ? Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)
        : products?.map((p) => <ProductCard key={p.product_id} product={p} />)}
    </div>
  )
}
