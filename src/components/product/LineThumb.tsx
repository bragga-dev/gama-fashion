import { Link } from 'react-router-dom'
import { ImageOff } from 'lucide-react'
import type { VariantWithProduct } from '@/types/product'

export function LineThumb({ variant, className = 'size-20' }: { variant: VariantWithProduct; className?: string }) {
  const img = variant.cover_image_url
    ? <img src={variant.cover_image_url} alt="" className="size-full object-cover" loading="lazy" />
    : <ImageOff className="size-6 text-brand-300" />
  const box = `${className} flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50`
  return variant.product_id
    ? <Link to={`/produtos/${variant.product_id}`} className={box}>{img}</Link>
    : <div className={box}>{img}</div>
}
