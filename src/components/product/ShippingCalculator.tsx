import { useState } from 'react'
import { Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { getErrorMessage } from '@/lib/errors'
import { maskCep, onlyDigits } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { cn } from '@/lib/cn'
import type { ShippingOption } from '@/types/product'

interface Props {
  quote: (cep: string) => Promise<ShippingOption[]>
  initialCep?: string
  /** Quando informado, as opções viram selecionáveis (carrinho/checkout). */
  selected?: string | null
  onSelect?: (option: ShippingOption) => void
  onQuoted?: (cep: string, options: ShippingOption[]) => void
}

export function ShippingCalculator({ quote, initialCep = '', selected, onSelect, onQuoted }: Props) {
  const [cep, setCep] = useState(maskCep(initialCep))
  const [options, setOptions] = useState<ShippingOption[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const run = async () => {
    const digits = onlyDigits(cep)
    if (digits.length !== 8) return setError('Informe um CEP com 8 dígitos.')
    setLoading(true); setError(null)
    try {
      const result = (await quote(digits)).filter((o) => !o.error)
      setOptions(result)
      onQuoted?.(digits, result)
      if (!result.length) setError('Nenhuma opção de frete disponível para este CEP.')
    } catch (e) {
      setError(getErrorMessage(e)); setOptions(null)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-3 rounded-3xl bg-brand-50 p-4">
      <p className="flex items-center gap-2 text-sm font-bold"><Truck className="size-4 text-brand-700" /> Calcular frete e prazo</p>
      <div className="flex items-start gap-2">
        <Input className="flex-1" aria-label="CEP" placeholder="00000-000" inputMode="numeric" value={cep}
          onChange={(e) => setCep(maskCep(e.target.value))} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), void run())} />
        <Button onClick={run} loading={loading} variant="secondary">Calcular</Button>
      </div>
      {error && <Alert>{error}</Alert>}
      {options && options.length > 0 && (
        <ul className="space-y-2">
          {options.map((o) => {
            const code = o.service_code ?? o.service
            const active = selected === code
            const content = (
              <>
                <span className="text-left">
                  <span className="block text-sm font-semibold">{o.carrier} · {o.service}</span>
                  <span className="text-xs text-brand-950/60">Entrega em até {o.delivery_time_days} {o.delivery_time_days === 1 ? 'dia útil' : 'dias úteis'}</span>
                </span>
                <span className="font-extrabold">{formatBRL(o.price)}</span>
              </>
            )
            return (
              <li key={code}>
                {onSelect ? (
                  <button type="button" onClick={() => onSelect(o)}
                    className={cn('flex w-full items-center justify-between gap-3 rounded-2xl border-2 bg-white px-4 py-3 transition',
                      active ? 'border-brand-700 ring-4 ring-brand-100' : 'border-transparent hover:border-brand-200')}>{content}</button>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
