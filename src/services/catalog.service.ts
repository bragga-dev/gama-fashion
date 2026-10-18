import { api } from '@/lib/api'
import type { Page } from '@/types/common'
import type { Category, Product, ProductFilters, ProductListItem, ShippingOption } from '@/types/product'
import type { Campaign, CampaignImage, ContactIn } from '@/types/campaign'
import type { RatingSummary, Review } from '@/types/review'

function clean<T extends object>(params: T) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== false))
}

export const catalogService = {
  listProducts: (filters: ProductFilters = {}) =>
    api.get<Page<ProductListItem>>('/products/', { params: clean(filters) }).then((r) => r.data),
  getProduct: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  listCategories: () =>
    api.get<Page<Category>>('/categories/', { params: { page_size: 50 } }).then((r) => r.data.items),
  quoteVariantShipping: (variantId: string, recipient_cep: string, quantity?: number) =>
    api.post<ShippingOption[]>(`/shipping/quote/${variantId}`, { recipient_cep, quantity }).then((r) => r.data),
}

export const reviewService = {
  listForProduct: (productId: string) => api.get<Review[]>(`/reviews/products/${productId}`).then((r) => r.data),
  summary: (productId: string) =>
    api.get<RatingSummary>(`/reviews/products/${productId}/summary`).then((r) => r.data),
  mine: () => api.get<Array<{ order_item: { order_item_id: string } }>>('/reviews/me').then((r) => r.data),
  create: (body: { order_item_id: string; reviews: number; comment?: string }) =>
    api.post('/reviews/', body).then((r) => r.data),
}

export const campaignService = {
  running: () => api.get<Campaign[]>('/campaigns/running').then((r) => r.data),
  images: (id: string) => api.get<CampaignImage[]>(`/campaigns/${id}/images`).then((r) => r.data),
}

export const contactService = {
  send: (body: ContactIn) => api.post('/contact/', body).then((r) => r.data),
}