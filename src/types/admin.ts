import type { Decimal, Page, UUID } from './common'
import type { OrderStatus, ShippingStatus, Order } from './order'
import type { Role } from './user'

export interface OrderAdminListItem {
  order_id: UUID
  code: string
  client_name: string | null
  client_email: string
  order_status: OrderStatus
  order_status_label: string
  shipping_status: ShippingStatus
  shipping_status_label: string
  items_count: number
  total_geral: Decimal
  shipping_tracking_code: string | null
  created_at: string
}

export interface OrderAdminAddress {
  cep: string; street: string; number: string; complement: string
  neighborhood: string; city: string; state: string; country: string
}

export interface OrderAdmin extends Order {
  client_user_id: UUID
  client_name: string | null
  client_email: string
  shipping_address: OrderAdminAddress | null
  frenet_order_id: string | null
  shipping_label_url: string | null
  canceled_at: string | null
  canceled_reason: string | null
}

export interface OrderSummary {
  total_orders: number
  by_status: Record<string, number>
  by_shipping_status: Record<string, number>
  awaiting_shipment: number
  revenue: Decimal
  average_ticket: Decimal
}

export interface OrderAdminFilters {
  page?: number
  page_size?: number
  order_status?: OrderStatus
  shipping_status?: ShippingStatus
  search?: string
  date_from?: string
  date_to?: string
}

export interface AdminUser {
  user_id: UUID
  email: string
  role: Role
  role_label: string | null
  is_trusty: boolean
  is_active: boolean
  date_joined: string
  created_at: string
  display_name: string | null
  photo_url: string | null
}

export type ContactStatus = 'pending' | 'in_progress' | 'resolved' | 'archived'

export interface Contact {
  contact_id: UUID
  full_name: string
  subject: string
  message: string
  email: string
  phone: string
  status: ContactStatus
  status_label: string
  created_at: string
}

export interface VariantInput {
  sku?: string | null
  size?: string | null
  color?: string | null
  price: string
  stock: number
}

export interface ShippingInput {
  weight: string; height: string; width: string; length: string; quantity: number
}

export interface ShippingData extends ShippingInput {
  product_shipping_id: UUID
  variant_id: UUID
}

export interface ProductFullInput {
  product_name: string
  product_category_id: UUID
  gender: string
  description: string
  variant: VariantInput
  shipping: ShippingInput
}

export interface CampaignInput {
  title: string
  description?: string | null
  starts_at?: string | null
  ends_at?: string | null
}

export type AdminPage<T> = Page<T>