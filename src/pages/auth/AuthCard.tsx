import type { ReactNode } from 'react'
import { Heart, Package, ShieldCheck, Truck } from 'lucide-react'

const perks = [
  { icon: Package, text: 'Acompanhe seus pedidos em tempo real' },
  { icon: Truck, text: 'Salve endereços e compre em poucos cliques' },
  { icon: ShieldCheck, text: 'Dados protegidos de acordo com a LGPD' },
  { icon: Heart, text: 'Novidades e ofertas da Gama Fashion' },
]

/** Casca das telas de autenticação: renderizada dentro do MainLayout (com cabeçalho e rodapé). */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2 lg:py-16">
      <aside className="relative hidden flex-col justify-between overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative space-y-4">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">Gama Fashion</span>
          <h2 className="text-4xl font-extrabold leading-tight">Treine com estilo. Vá além.</h2>
          <p className="max-w-sm text-brand-100">Sua conta deixa a compra mais rápida e o acompanhamento dos pedidos mais simples.</p>
        </div>
        <ul className="relative space-y-3">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 rounded-full bg-white/10 py-2.5 pl-2.5 pr-5 text-sm backdrop-blur">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-700"><Icon className="size-4" /></span>{text}
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex items-center">
        <div className="mx-auto w-full max-w-md space-y-5">
          <div className="space-y-6 rounded-[2rem] border border-brand-100 bg-white p-7 shadow-soft sm:p-9">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-extrabold">{title}</h1>
              {subtitle && <p className="text-sm text-brand-950/70">{subtitle}</p>}
            </div>
            {children}
          </div>
          {footer && <p className="text-center text-sm text-brand-950/70 [&_a]:font-bold [&_a]:text-brand-700 [&_a]:underline">{footer}</p>}
        </div>
      </div>
    </div>
  )
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs font-medium text-brand-950/50">
      <span className="h-px flex-1 bg-brand-100" />ou<span className="h-px flex-1 bg-brand-100" />
    </div>
  )
}