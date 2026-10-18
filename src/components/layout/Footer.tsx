import { Link } from 'react-router-dom'
import { AtSign, Mail, MessageCircle, ShieldCheck, Truck, CreditCard } from 'lucide-react'
import { Logo } from './Logo'
import { env } from '@/lib/env'

const col = 'space-y-2.5 text-sm text-brand-100'
const link = 'transition hover:text-white hover:underline'

export function Footer() {
  return (
    <footer className="mt-20 rounded-t-[2.5rem] bg-brand-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm text-brand-200">Moda fitness masculina e feminina com conforto, estilo e performance para o seu treino e o seu dia a dia.</p>
          <div className="flex gap-2">
            {env.whatsapp && (
              <a href={`https://wa.me/${env.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand-600"><MessageCircle className="size-5" /></a>
            )}
            <Link to="/contato" aria-label="Contato" className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand-600"><Mail className="size-5" /></Link>
            <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-white/10"><AtSign className="size-5" /></span>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-300">Loja</h3>
          <ul className={col}>
            <li><Link className={link} to="/produtos?sort=recent">Novidades</Link></li>
            <li><Link className={link} to="/produtos?gender=feminino">Feminino</Link></li>
            <li><Link className={link} to="/produtos?gender=masculino">Masculino</Link></li>
            <li><Link className={link} to="/produtos">Todos os produtos</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-300">Minha conta</h3>
          <ul className={col}>
            <li><Link className={link} to="/painel/meus-pedidos">Meus pedidos</Link></li>
            <li><Link className={link} to="/painel/perfil">Meus dados</Link></li>
            <li><Link className={link} to="/painel/enderecos">Endereços</Link></li>
            <li><Link className={link} to="/contato">Fale conosco</Link></li>
            <li><Link className={link} to="/termos">Termos de Uso</Link></li>
            <li><Link className={link} to="/privacidade">Política de Privacidade</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-300">Compra segura</h3>
          <ul className={col}>
            <li className="flex items-center gap-2"><Truck className="size-4" /> Envio para todo o Brasil</li>
            <li className="flex items-center gap-2"><CreditCard className="size-4" /> PIX, boleto e cartão</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4" /> Dados protegidos (LGPD)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-brand-300">
        © {new Date().getFullYear()} Gama Fashion - Moda Fitness. Todos os direitos reservados.
      </div>
    </footer>
  )
}