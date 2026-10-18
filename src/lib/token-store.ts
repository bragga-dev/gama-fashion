// O access token (JWT curto) fica SÓ em memória — nunca em localStorage.
// O refresh é um cookie httpOnly gerenciado pelo browser.
let accessToken: string | null = null
const listeners = new Set<() => void>()

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => { accessToken = token },
  clear: () => { accessToken = null },
  /** Chamado quando o refresh falha: AuthContext limpa o usuário e manda para o login. */
  onSessionExpired: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } },
  emitSessionExpired: () => listeners.forEach((fn) => fn()),
}
