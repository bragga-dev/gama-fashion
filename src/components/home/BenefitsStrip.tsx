import { CreditCard, RefreshCw, ShieldCheck, Truck } from 'lucide-react'

const items = [
  { icon: Truck, title: 'Envio para todo o Brasil', text: 'Frete calculado pelo seu CEP' },
  { icon: CreditCard, title: 'Pague como preferir', text: 'PIX, boleto ou cartão' },
  { icon: ShieldCheck, title: 'Compra segura', text: 'Seus dados protegidos' },
  { icon: RefreshCw, title: 'Troca facilitada', text: 'Fale com a gente' },
]

export function BenefitsStrip() {
  return (
    <section aria-label="Vantagens" className="mx-auto max-w-7xl px-4 pt-10">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 rounded-full bg-brand-50 py-3 pl-3 pr-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white"><Icon className="size-5" /></span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold">{title}</span><span className="block truncate text-xs text-brand-950/60">{text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  )
}
