export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '/api',
  googleClientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '',
  whatsapp: (import.meta.env.VITE_WHATSAPP as string | undefined) ?? '',
}

export const STORE_NAME = 'Gama Fashion'
export const STORE_TAGLINE = 'Moda Fitness'
