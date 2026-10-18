import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Bell, MapPin, Package, UserCog } from 'lucide-react'
import { AnnouncementBar } from './AnnouncementBar'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieNotice } from '@/components/CookieNotice'
import { PageLoader } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/cn'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <CookieNotice />
    </div>
  )
}

/** Exige um papel específico; quem tem o papel errado vai para a sua própria área. */
function RequireRole({ role }: { role: 'client' | 'admin' }) {
  const { me, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <PageLoader />
  if (!me) return <Navigate to="/entrar" replace state={{ from: location.pathname + location.search }} />
  if (me.user.role !== role) return <Navigate to={me.user.role === 'admin' ? '/painel/dashboard' : '/'} replace />
  return <Outlet />
}
export const RequireClient = () => <RequireRole role="client" />
export const RequireAdmin = () => <RequireRole role="admin" />

/** /painel → área correta conforme o papel. */
export function PanelIndex() {
  const { me, isLoading } = useAuth()
  if (isLoading) return <PageLoader />
  if (!me) return <Navigate to="/entrar" replace state={{ from: '/painel' }} />
  return <Navigate to={me.user.role === 'admin' ? '/painel/dashboard' : '/painel/meus-pedidos'} replace />
}

/** Exige login. Guarda a rota de origem para voltar depois do login. */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/entrar" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}

const tabs = [
  { to: '/painel/meus-pedidos', label: 'Pedidos', icon: Package },
  { to: '/painel/perfil', label: 'Meus dados', icon: UserCog },
  { to: '/painel/enderecos', label: 'Endereços', icon: MapPin },
  { to: '/painel/notificacoes', label: 'Notificações', icon: Bell },
]

export function AccountLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold">Minha conta</h1>
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Conta" className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => cn(
                'flex shrink-0 items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition',
                isActive ? 'bg-brand-700 text-white shadow-soft' : 'bg-brand-50 text-brand-800 hover:bg-brand-100',
              )}>
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <section className="min-w-0"><Outlet /></section>
      </div>
    </div>
  )
}