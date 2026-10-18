import type { UUID } from './common'

export type Role = 'admin' | 'client'

export interface User {
  user_id: UUID
  email: string
  role: Role
  is_trusty: boolean
  is_active: boolean
  date_joined: string
  created_at: string
  role_label?: string | null
}

export interface ClientProfile {
  client_id: UUID
  username: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  photo_url: string | null
  gender: string
  gender_label: string
  birth_date: string | null
  cpf: string | null
}

export interface AdminProfile {
  admin_id: UUID
  full_name: string
  photo_url?: string | null
}

export interface Me {
  user: User
  client: ClientProfile | null
  admin: AdminProfile | null
}

export interface Session {
  id: number
  created_at: string | null
  expires_at: string
  device: string | null
}

export interface ClientUpdateIn {
  username?: string
  first_name?: string
  last_name?: string
  gender?: string
  phone?: string
  birth_date?: string | null
  cpf?: string
}

export interface RegisterIn {
  email: string
  password: string
  password2: string
  accepted_terms: boolean
  marketing_opt_in: boolean
}
