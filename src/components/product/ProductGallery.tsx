import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ProductImage } from '@/types/product'

export function ProductGallery({ images, alt }: { images: ProductImage[]; alt: string }) {
  const sorted = [...images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.display_order - b.display_order)
  const [active, setActive] = useState(0)
  const current = sorted[active]

  if (!sorted.length) {
    return <div className="flex aspect-[3/4] items-center justify-center rounded-[2rem] bg-brand-50 text-brand-300"><ImageOff className="size-14" /></div>
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[5rem_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto scrollbar-none sm:order-1 sm:flex-col">
        {sorted.map((img, i) => (
          <button key={img.image_id} onClick={() => setActive(i)} aria-label={`Foto ${i + 1}`}
            className={cn('size-16 shrink-0 overflow-hidden rounded-2xl border-2 transition sm:size-20', i === active ? 'border-brand-700' : 'border-transparent opacity-70 hover:opacity-100')}>
            <img src={img.product_image_url} alt="" loading="lazy" className="size-full object-cover" />
          </button>
        ))}
      </div>
      <div className="order-1 aspect-[3/4] overflow-hidden rounded-[2rem] bg-brand-50 sm:order-2">
        <img src={current.product_image_url} alt={alt} className="size-full object-cover" />
      </div>
    </div>
  )
}
