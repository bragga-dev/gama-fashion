import type { UUID } from './common'

export interface Address {
  address_id: UUID
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  state_label: string
  country: string
  is_preferential: boolean
}

export interface AddressIn {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  country: string
}
