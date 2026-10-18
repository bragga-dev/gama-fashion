import { createContext, useCallback, useRef, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { refreshAccessToken } from '@/lib/api'
import { tokenStore } from '@/lib/token-store'
import { authService } from '@/services/auth.service'
import type { Me } from '@/types/user'

interface AuthContextValue {
  me: Me | null
  isLoading: boolean
  isAuthenticated: boolean
  isClient: boolean
  isAdmin: boolean
  /** Guarda o access devolvido por login/register/google e carrega /auth/me. */
  signIn: (access: string) => Promise<Me>
  signOut: () => Promise<void>
  reload: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)
  const [isLoading, setLoading] = useState(true)
  const qc = useQueryClient()
  const channel = useRef<BroadcastChannel | null>(null)

  const clearLocal = useCallback(() => {
    tokenStore.clear()
    setMe(null)
    qc.removeQueries({ queryKey: ['cart'] })
    qc.removeQueries({ queryKey: ['orders'] })
    qc.removeQueries({ queryKey: ['addresses'] })
    qc.removeQueries({ queryKey: ['notifications'] })
  }, [qc])

  // Restaura a sessão no carregamento: o cookie httpOnly de refresh gera um novo access.
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await refreshAccessToken()
        const data = await authService.me()
        if (alive) setMe(data)
      } catch {
        if (alive) clearLocal()
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [clearLocal])

  // Sincroniza login/logout entre abas (o canal não carrega token, só o aviso).
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const ch = new BroadcastChannel('gama-fashion-auth')
    channel.current = ch
    ch.onmessage = async (ev: MessageEvent<'logout' | 'login'>) => {
      if (ev.data === 'logout') clearLocal()
      if (ev.data === 'login') {
        try { await refreshAccessToken(); setMe(await authService.me()) } catch { /* segue deslogado */ }
      }
    }
    return () => { ch.close(); channel.current = null }
  }, [clearLocal])

  // Refresh falhou durante uma requisição (401/403): limpa o estado local.
  useEffect(() => tokenStore.onSessionExpired(clearLocal), [clearLocal])

  const signIn = useCallback(async (access: string) => {
    tokenStore.set(access)
    const data = await authService.me()
    setMe(data)
    channel.current?.postMessage('login')
    return data
  }, [])

  const signOut = useCallback(async () => {
    try { await authService.logout() } catch { /* a sessão local é descartada de qualquer forma */ }
    clearLocal()
    channel.current?.postMessage('logout')
  }, [clearLocal])

  const reload = useCallback(async () => {
    setMe(await authService.me())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      me,
      isLoading,
      isAuthenticated: !!me,
      isClient: me?.user.role === 'client',
      isAdmin: me?.user.role === 'admin',
      signIn,
      signOut,
      reload,
    }),
    [me, isLoading, signIn, signOut, reload],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}