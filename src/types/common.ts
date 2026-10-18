/** Decimal chega como string ("199.90") — ver contrato §4. */
export type Decimal = string
export type UUID = string
export type ISODate = string

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface Message {
  detail: string
}

export interface FieldError {
  field: string
  message: string
  type: string
}
