import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App'
import { AuthProvider } from '@/contexts/AuthContext'
import { env } from '@/lib/env'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, err) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        return !(status && status >= 400 && status < 500) && count < 2
      },
    },
  },
})

const app = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider><App /></AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>{env.googleClientId ? <GoogleOAuthProvider clientId={env.googleClientId}>{app}</GoogleOAuthProvider> : app}</StrictMode>,
)
