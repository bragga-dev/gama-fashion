import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import { tokenStore } from './token-store'

export const api = axios.create({ baseURL: env.apiUrl, withCredentials: true })

// Cliente "cru" (sem interceptors) usado só no refresh, para não entrar em loop.
const bare = axios.create({ baseURL: env.apiUrl, withCredentials: true })

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh', '/auth/password-reset']

let refreshPromise: Promise<string> | null = null

async function doRefresh(): Promise<string> {
  const { data } = await bare.post<{ access: string }>('/auth/refresh')
  tokenStore.set(data.access)
  return data.access
}

/**
 * Single-flight (contrato §2): uma única renovação por vez.
 * Web Locks serializa também entre abas, já que o refresh é rotacionado a cada uso.
 */
export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const run = () => doRefresh()
    const p = typeof navigator !== 'undefined' && 'locks' in navigator
      ? navigator.locks.request('gama-fashion-refresh', run)
      : run()
    refreshPromise = (p as Promise<string>).finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

type Retryable = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as Retryable | undefined
    const url = original?.url ?? ''
    const skip = NO_REFRESH.some((p) => url.startsWith(p))

    if (error.response?.status === 401 && original && !original._retry && !skip) {
      original._retry = true
      try {
        const access = await refreshAccessToken()
        original.headers.set('Authorization', `Bearer ${access}`)
        return api(original)
      } catch {
        tokenStore.clear()
        tokenStore.emitSessionExpired()
      }
    }
    return Promise.reject(error)
  },
)
