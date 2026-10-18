import type { Decimal, Page, UUID } from './common'

export type Gender = 'masculino' | 'feminino' | 'unissex'

export interface Category {
  product_category_id: UUID
  category_name: string
  category_image_url: string
  is_active: boolean
}

export interface Variant {
  variant_id: UUID
  sku: string | null
  size: string | null
  color: string | null
  price: Decimal
  stock: number
  is_active: boolean
  in_stock: boolean
}

/**
 * Variante dentro de carrinho/pedido. `product_*` e `cover_image_url` dependem do patch
 * do back (VariantWithProductOut); o front funciona sem eles, mas mostra um placeholder.
 */
export interface VariantWithProduct extends Variant {
  product_id?: UUID
  product_name?: string
  cover_image_url?: string | null
}

export interface ProductImage {
  image_id: UUID
  product_image_url: string
  is_cover: boolean
  display_order: number
}

export interface ProductListItem {
  product_id: UUID
  product_name: string
  gender: Gender
  description: string
  category: Category
  is_active: boolean
  variants: Variant[]
  cover_image: ProductImage | null
  min_price: Decimal | null
  max_price: Decimal | null
  in_stock: boolean
}

export interface Product extends ProductListItem {
  images: ProductImage[]
  created_at: string
  updated_at: string
}

export interface ProductFilters {
  page?: number
  page_size?: number
  search?: string
  product_category_id?: UUID
  gender?: Gender
  size?: string
  color?: string
  in_stock_only?: boolean
  sort?: 'recent'
}

export type ProductPage = Page<ProductListItem>

export interface ShippingOption {
  carrier: string
  service: string
  service_code: string | null
  price: Decimal
  delivery_time_days: number
  error: boolean
  error_message: string | null
}
