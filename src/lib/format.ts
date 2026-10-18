export const onlyDigits = (v: string) => v.replace(/\D/g, '')

export function maskCep(v: string) {
  const d = onlyDigits(v).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function maskCpf(v: string) {
  const d = onlyDigits(v).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskCardNumber(v: string) {
  return onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function formatDate(iso?: string | null, withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  return withTime
    ? d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : d.toLocaleDateString('pt-BR')
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)} min`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `${Math.floor(diff / 86400)} d`
  return formatDate(iso)
}

export const GENDER_LABEL: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  unissex: 'Unissex',
}

export const COLOR_LABEL: Record<string, string> = {
  black: 'Preto', white: 'Branco', red: 'Vermelho', blue: 'Azul', green: 'Verde',
  pink: 'Rosa', yellow: 'Amarelo', orange: 'Laranja', purple: 'Roxo', brown: 'Marrom',
  beige: 'Bege', gray: 'Cinza', navy: 'Azul-marinho', wine: 'Vinho', off_white: 'Off-White',
}

export const COLOR_HEX: Record<string, string> = {
  black: '#111111', white: '#ffffff', red: '#dc2626', blue: '#2563eb', green: '#16a34a',
  pink: '#ec4899', yellow: '#facc15', orange: '#f97316', purple: '#6b2d83', brown: '#78350f',
  beige: '#d6c4a8', gray: '#9ca3af', navy: '#1e3a8a', wine: '#8e1b3f', off_white: '#f5f1e8',
}

export const SIZE_ORDER = [
  'PP', 'P', 'M', 'G', 'GG', 'XGG', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6',
  '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60', '62', '64',
]

export const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))

export const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

export const ORDER_STATUS_TONE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-gray-200 text-gray-700',
  REFUNDED: 'bg-sky-100 text-sky-800',
  FAILED: 'bg-red-100 text-red-700',
}

export const lineTitle = (v: { product_name?: string; sku: string | null }) => v.product_name ?? v.sku ?? 'Produto'
export const variantInfo = (v: { size: string | null; color: string | null }) =>
  [v.size && `Tam. ${v.size}`, v.color && (COLOR_LABEL[v.color] ?? v.color)].filter(Boolean).join(' · ')
