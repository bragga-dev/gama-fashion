import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { COLOR_HEX, COLOR_LABEL, sortSizes } from '@/lib/format'
import type { Variant } from '@/types/product'

interface Props {
  variants: Variant[]
  size: string | null
  color: string | null
  onSize: (s: string) => void
  onColor: (c: string) => void
}

const uniq = (list: (string | null)[]) => [...new Set(list.filter(Boolean))] as string[]

export function VariantSelector({ variants, size, color, onSize, onColor }: Props) {
  const sizes = sortSizes(uniq(variants.map((v) => v.size)))
  const colors = uniq(variants.map((v) => v.color))

  // Combinação existe e tem estoque? (considera a seleção da outra dimensão)
  const available = (s: string | null, c: string | null) =>
    variants.some((v) => v.in_stock && (!s || v.size === s) && (!c || v.color === c))

  return (
    <div className="space-y-5">
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Cor: <span className="font-normal text-brand-950/70">{color ? COLOR_LABEL[color] ?? color : 'selecione'}</span></p>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const ok = available(size, c)
              return (
                <button key={c} type="button" onClick={() => onColor(c)} aria-label={COLOR_LABEL[c] ?? c} aria-pressed={color === c} title={COLOR_LABEL[c] ?? c}
                  className={cn('relative flex size-10 items-center justify-center rounded-full border-2 transition',
                    color === c ? 'border-brand-700 ring-4 ring-brand-100' : 'border-brand-200 hover:border-brand-400', !ok && 'opacity-40')}>
                  <span className="size-7 rounded-full border border-black/10" style={{ backgroundColor: COLOR_HEX[c] ?? '#ccc' }} />
                  {color === c && <Check className={cn('absolute size-4', ['white', 'off_white', 'yellow', 'beige'].includes(c) ? 'text-brand-900' : 'text-white')} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Tamanho: <span className="font-normal text-brand-950/70">{size ?? 'selecione'}</span></p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const ok = available(s, color)
              return (
                <button key={s} type="button" onClick={() => onSize(s)} aria-pressed={size === s}
                  className={cn('h-11 min-w-11 rounded-full border-2 px-4 text-sm font-bold transition',
                    size === s ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-200 hover:border-brand-500',
                    !ok && 'text-brand-950/35 line-through')}>
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
