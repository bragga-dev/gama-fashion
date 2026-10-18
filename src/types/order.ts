import type { Decimal, Page, UUID } from './common'
import type { VariantWithProduct } from './product'

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'FAILED'
export type ShippingStatus = 'pending' | 'label_generated' | 'shipped' | 'in_transit' | 'delivered'

export interface OrderItem {
  order_item_id: UUID
  variant: VariantWithProduct
  order_item_quantity: number
  order_item_price: Decimal
  subtotal: Decimal
}

export interface Order {
  order_id: UUID
  code: string
  order_status: OrderStatus
  order_status_label: string
  items: OrderItem[]
  subtotal: Decimal
  order_shipping_total: Decimal
  total_geral: Decimal
  shipping_address_id: UUID
  shipping_service_code: string | null
  shipping_service_name: string | null
  shipping_delivery_days: number | null
  shipping_status: ShippingStatus
  shipping_status_label: string
  shipping_tracking_code: string | null
  completed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderCreateIn {
  shipping_address_id: UUID
  shipping_service_code: string
}

export type OrderPage = Page<Order>
