import axios from 'axios'
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import type { FieldError as ApiFieldError } from '@/types/common'

export class ApiError extends Error {
  status: number
  errors: ApiFieldError[]
  constructor(message: string, status = 0, errors: ApiFieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const VALIDATION_BY_TYPE: Record<string, string> = {
  missing: 'Campo obrigatório.',
  string_too_short: 'Valor muito curto.',
  string_too_long: 'Valor muito longo.',
  string_type: 'Valor inválido.',
  int_parsing: 'Informe um número inteiro.',
  decimal_parsing: 'Informe um número válido.',
  value_error: '',
  enum: 'Opção inválida.',
  uuid_parsing: 'Identificador inválido.',
  bool_parsing: 'Valor inválido.',
  greater_than: 'Valor abaixo do permitido.',
  less_than: 'Valor acima do permitido.',
  json_invalid: 'JSON inválido.',
}

/** O back devolve a mensagem Pydantic em inglês: traduz pelo `type` (contrato §3). */
export function translateFieldError(e: ApiFieldError): string {
  if (e.type === 'value_error') return e.message.replace(/^Value error,\s*/i, '')
  if (e.type === 'value_error.email' || e.message.toLowerCase().includes('email address')) return 'E-mail inválido.'
  return VALIDATION_BY_TYPE[e.type] || e.message
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (axios.isAxiosError(err)) {
    if (!err.response) return new ApiError('Sem conexão com o servidor. Verifique sua internet.', 0)
    const data = err.response.data as { detail?: unknown; errors?: ApiFieldError[] } | undefined
    const detail = typeof data?.detail === 'string' ? data.detail : 'Ocorreu um erro inesperado.'
    return new ApiError(detail, err.response.status, data?.errors ?? [])
  }
  return new ApiError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado.')
}

export const getErrorMessage = (err: unknown) => toApiError(err).message

/** Marca cada campo do RHF com o erro vindo do 422; devolve true se algum campo foi marcado. */
export function applyFieldErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): boolean {
  const apiErr = toApiError(err)
  let applied = false
  for (const e of apiErr.errors) {
    if (!e.field) continue
    setError(e.field as FieldPath<T>, { type: 'server', message: translateFieldError(e) })
    applied = true
  }
  return applied
}

/** Erros gerais do formulário (field vazio) + detail. */
export function formLevelMessage(err: unknown): string | null {
  const apiErr = toApiError(err)
  const general = apiErr.errors.filter((e) => !e.field).map(translateFieldError)
  if (general.length) return general.join(' ')
  return apiErr.errors.length ? null : apiErr.message
}
