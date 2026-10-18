/** Só aceita https (http apenas em dev) — evita `javascript:` e similares vindos de dados externos. */
export function safeExternalUrl(url?: string | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.protocol === 'https:' || (import.meta.env.DEV && u.protocol === 'http:')) return u.toString()
  } catch { /* URL inválida */ }
  return null
}

/** Só aceita caminho interno ("/painel/..."): rejeita "//host", "\\" e esquemas. */
export function safeInternalPath(path?: string | null): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null
  return path
}