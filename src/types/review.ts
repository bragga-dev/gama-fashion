import type { Decimal, UUID } from './common'
import type { OrderItem } from './order'
import type { User } from './user'

export interface Review {
  reviews_id: UUID
  order_item: OrderItem
  user: User
  reviews: 1 | 2 | 3 | 4 | 5
  reviews_label: string
  comment: string | null
  created_at: string
}

export interface ReviewPrivate extends Review {
  updated_at: string
  is_authorized: boolean
}

export interface ReviewCreateIn {
  order_item_id: UUID
  reviews: number
  comment?: string
}

export interface RatingSummary {
  product_id: UUID
  average_rating: Decimal
  total_reviews: number
}
