import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Boxes, ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Menu, MessageSquareText, Package, Shapes, Star, UserCog, Users, X } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { IconButton } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/cn'

const links = [
  { to: '/painel/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/painel/pedidos', label: 'Pedidos', icon: Package },
  { to: '/painel/produtos', label: 'Produtos', icon: Boxes },
  { to: '/painel/categorias', label: 'Categorias', icon: Shapes },
  { to: '/painel/avaliacoes', label: 'Avaliações', icon: Star },
  { to: '/painel/campanhas', label: 'Campanhas', icon: ImageIcon },
  { to: '/painel/mensagens', label: 'Mensagens', icon: MessageSquareText },
  { to: '/painel/usuarios', label: 'Usuários', icon: Users },
  { to: '/painel/meu-perfil', label: 'Meu perfil', icon: UserCog },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { me, signOut } = useAuth()
  const navigate = useNavigate()
  const name = me?.admin?.full_name ?? me?.user.email

  const nav = (
    <nav aria-label="Administração" className="flex flex-col gap-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={() => setOpen(false)}
          className={({ isActive }) => cn('flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition',
            isActive ? 'bg-white text-brand-800 shadow-soft' : 'text-brand-100 hover:bg-white/10')}>
          <Icon className="size-4" /> {label}
        </NavLink>
      ))}
      <Link to="/" target="_blank" className="mt-4 flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-brand-200 hover:bg-white/10"><ExternalLink className="size-4" /> Ver loja</Link>
      <button onClick={() => { void signOut().then(() => navigate('/')) }} className="flex items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold text-brand-200 hover:bg-white/10"><LogOut className="size-4" /> Sair</button>
    </nav>
  )

  return (
    <div className="min-h-screen bg-brand-50/60 lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto rounded-r-[2.5rem] bg-gradient-to-b from-brand-950 to-brand-800 p-5 lg:flex">
        <Logo light />
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto rounded-r-[2rem] bg-gradient-to-b from-brand-950 to-brand-800 p-5">
            <div className="flex items-center justify-between"><Logo light /><IconButton label="Fechar" className="text-white hover:bg-white/10" onClick={() => setOpen(false)}><X className="size-5" /></IconButton></div>
            {nav}
          </aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-brand-100 bg-white/90 px-4 backdrop-blur">
          <IconButton label="Abrir menu" className="lg:hidden" onClick={() => setOpen(true)}><Menu className="size-6" /></IconButton>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-700">Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <Link to="/painel/meu-perfil" className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-brand-100">
              {me?.admin?.photo_url ? <img src={me.admin.photo_url} alt="" className="size-9 rounded-full object-cover" />
                : <span className="flex size-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">{name?.[0]?.toUpperCase()}</span>}
              <span className="hidden max-w-40 truncate text-sm font-semibold sm:block">{name}</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}