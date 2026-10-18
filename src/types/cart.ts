import type { Decimal, UUID } from './common'
import type { VariantWithProduct } from './product'

export interface CartItem {
  cart_item_id: UUID
  variant: VariantWithProduct
  quantity_item: number
  unit_price_item: Decimal
  shipping_type: string | null
  shipping_value: Decimal
  subtotal: Decimal
}

export interface Cart {
  cart_id: UUID
  items: CartItem[]
  total_price: Decimal
  total_shipping: Decimal
  total_geral: Decimal
}
