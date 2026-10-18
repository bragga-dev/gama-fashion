import type { ReactNode } from 'react'
import heroImage from '@/assets/auth/auth-hero.jpg'
import { Heart, Package, ShieldCheck, Truck } from 'lucide-react'

const perks = [
  { icon: Package, text: 'Acompanhe seus pedidos' },
  { icon: Truck, text: 'Compre em poucos cliques' },
  { icon: ShieldCheck, text: 'Dados protegidos (LGPD)' },
  { icon: Heart, text: 'Novidades e ofertas' },
]

/** Casca das telas de autenticação: renderizada dentro do MainLayout (com cabeçalho e rodapé). */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2 lg:py-16">
      <aside className="relative hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-[2.5rem] bg-brand-950 p-10 text-white lg:flex">
        <img src={heroImage} alt="" width={1200} height={1803} decoding="async" className="absolute inset-0 size-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-950/10 to-brand-950/90" />
        <div className="relative space-y-4">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">Gama Fashion</span>
          <h2 className="max-w-xs text-4xl font-extrabold leading-tight">Treine com estilo. Vá além.</h2>
        </div>
        <ul className="relative grid grid-cols-2 gap-2.5">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 rounded-full bg-white/15 py-2 pl-2 pr-4 text-xs font-semibold backdrop-blur-md">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-brand-700"><Icon className="size-4" /></span>{text}
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