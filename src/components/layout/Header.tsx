import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, Heart, LogOut, MapPin, Menu, Package, Search, ShoppingBag, User, UserCog, X } from 'lucide-react'
import { IconButton, ButtonLink } from '@/components/ui/Button'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Logo } from './Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useCart, cartCount } from '@/hooks/useCart'
import { useCategories } from '@/hooks/useCatalog'
import { cn } from '@/lib/cn'

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-brand-100', isActive && 'bg-brand-100 text-brand-800')

function SearchBar({ className, onDone }: { className?: string; onDone?: () => void }) {
  const [params] = useSearchParams()
  const [value, setValue] = useState(params.get('search') ?? '')
  const navigate = useNavigate()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(value.trim() ? `/produtos?search=${encodeURIComponent(value.trim())}` : '/produtos')
    onDone?.()
  }
  return (
    <form onSubmit={submit} role="search" className={cn('relative', className)}>
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="O que você procura?" aria-label="Buscar produtos"
        className="h-11 w-full rounded-full border border-brand-200 bg-brand-50 pl-5 pr-14 text-sm placeholder:text-brand-950/50 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100" />
      <button type="submit" aria-label="Buscar" className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-full bg-brand-700 text-white transition hover:bg-brand-800">
        <Search className="size-4" />
      </button>
    </form>
  )
}

function AccountMenu() {
  const { me, isAuthenticated, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  if (!isAuthenticated) {
    return (
      <>
        <IconButton label="Entrar" className="sm:hidden" onClick={() => navigate('/entrar')}><User className="size-5" /></IconButton>
        <ButtonLink to="/entrar" size="sm" variant="secondary" className="hidden sm:inline-flex"><User className="size-4" /> Entrar</ButtonLink>
      </>
    )
  }

  const photo = me?.client?.photo_url ?? me?.admin?.photo_url
  const name = me?.client?.first_name || me?.admin?.full_name?.split(' ')[0] || me?.user.email.split('@')[0]
  const item = 'flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium hover:bg-brand-50'

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Minha conta"
        className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-brand-100 sm:pr-3">
        {photo
          ? <img src={photo} alt="" className="size-9 rounded-full object-cover ring-2 ring-brand-200" />
          : <span className="flex size-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">{name?.[0]?.toUpperCase()}</span>}
        <span className="hidden max-w-24 truncate text-sm font-semibold sm:block">{name}</span>
        <ChevronDown className="hidden size-4 sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 rounded-3xl border border-brand-100 bg-white p-2 shadow-soft" onClick={() => setOpen(false)}>
          <p className="truncate px-4 py-2 text-xs text-brand-950/60">{me?.user.email}</p>
          <Link to="/painel/meus-pedidos" className={item}><Package className="size-4 text-brand-600" /> Meus pedidos</Link>
          <Link to="/painel/perfil" className={item}><UserCog className="size-4 text-brand-600" /> Meus dados</Link>
          <Link to="/painel/enderecos" className={item}><MapPin className="size-4 text-brand-600" /> Endereços</Link>
          <button onClick={() => { void signOut().then(() => navigate('/')) }} className={cn(item, 'w-full text-left text-red-600')}>
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, isClient } = useAuth()
  const { data: cart } = useCart()
  const { data: categories } = useCategories()
  const count = cartCount(cart)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-6">
        <IconButton label="Abrir menu" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-6" /></IconButton>
        <Logo />
        <SearchBar className="hidden max-w-xl flex-1 md:block" />
        <div className="ml-auto flex items-center gap-1">
          <AccountMenu />
          {isAuthenticated && <NotificationBell />}
          <Link to="/carrinho" aria-label="Carrinho" title="Carrinho"
            className="relative inline-flex size-11 items-center justify-center rounded-full text-brand-900 transition-colors hover:bg-brand-100 active:scale-95">
            <ShoppingBag className="size-5" />
            {isClient && count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white">{count}</span>
            )}
          </Link>
        </div>
      </div>

      <div className="mx-auto px-4 pb-3 md:hidden"><SearchBar /></div>

      <nav aria-label="Principal" className="hidden border-t border-brand-100 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1.5">
          <NavLink to="/produtos?sort=recent" className={navLink}>Novidades</NavLink>
          <NavLink to="/produtos?gender=feminino" className={navLink}>Feminino</NavLink>
          <NavLink to="/produtos?gender=masculino" className={navLink}>Masculino</NavLink>
          {categories?.slice(0, 7).map((c) => (
            <NavLink key={c.product_category_id} to={`/produtos?category=${c.product_category_id}`} className={navLink}>{c.category_name}</NavLink>
          ))}
          <NavLink to="/contato" className={cn(navLink({ isActive: false }), 'ml-auto')}>Fale conosco</NavLink>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col gap-1 overflow-y-auto rounded-r-[2rem] bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <IconButton label="Fechar menu" onClick={() => setMobileOpen(false)}><X className="size-5" /></IconButton>
            </div>
            {[
              ['/produtos?sort=recent', 'Novidades'],
              ['/produtos?gender=feminino', 'Feminino'],
              ['/produtos?gender=masculino', 'Masculino'],
              ['/produtos', 'Todos os produtos'],
            ].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="rounded-full px-4 py-3 font-semibold hover:bg-brand-50">{label}</Link>
            ))}
            {!!categories?.length && <p className="mt-4 px-4 text-xs font-bold uppercase tracking-widest text-brand-600">Categorias</p>}
            {categories?.map((c) => (
              <Link key={c.product_category_id} to={`/produtos?category=${c.product_category_id}`} onClick={() => setMobileOpen(false)}
                className="rounded-full px-4 py-2.5 text-sm hover:bg-brand-50">{c.category_name}</Link>
            ))}
            <div className="mt-4 border-t border-brand-100 pt-4">
              <Link to="/contato" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold hover:bg-brand-50"><Heart className="size-4 text-brand-600" /> Fale conosco</Link>
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
