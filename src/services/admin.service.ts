import { api } from '@/lib/api'
import type { Message, Page } from '@/types/common'
import type { Category, Product, ProductImage, ProductListItem, Variant } from '@/types/product'
import type { Campaign, CampaignImage } from '@/types/campaign'
import type { ReviewPrivate } from '@/types/review'
import type {
  AdminUser, CampaignInput, Contact, ContactStatus, OrderAdmin, OrderAdminFilters, OrderAdminListItem,
  OrderSummary, ProductFullInput, ShippingData, ShippingInput, VariantInput,
} from '@/types/admin'

const clean = <T extends object>(p: T) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== '' && v !== null))

function form(fields: Record<string, string | Blob>) {
  const f = new FormData()
  Object.entries(fields).forEach(([k, v]) => f.append(k, v))
  return f
}

export const adminOrders = {
  list: (params: OrderAdminFilters) => api.get<Page<OrderAdminListItem>>('/orders/admin/list', { params: clean(params) }).then((r) => r.data),
  summary: (params: { date_from?: string; date_to?: string } = {}) =>
    api.get<OrderSummary>('/orders/admin/summary', { params: clean(params) }).then((r) => r.data),
  get: (id: string) => api.get<OrderAdmin>(`/orders/admin/${id}`).then((r) => r.data),
  generateLabel: (id: string) =>
    api.post<{ success: boolean; frenet_shipment_id: string; tracking_code: string; label_url: string }>(`/orders/${id}/generate-label`).then((r) => r.data),
  markDelivered: (id: string) => api.post<OrderAdmin>(`/orders/${id}/mark-delivered`).then((r) => r.data),
}

export const adminProducts = {
  list: (params: Record<string, unknown>) => api.get<Page<ProductListItem>>('/products/admin/list', { params: clean(params) }).then((r) => r.data),
  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  createFull: (payload: ProductFullInput, images: File[], coverIndex: number) => {
    const f = form({ payload: JSON.stringify(payload), cover_index: String(coverIndex) })
    images.forEach((img) => f.append('images', img))
    return api.post<Product>('/products/full', f).then((r) => r.data)
  },
  update: (id: string, body: Record<string, unknown>) => api.patch<Product>(`/products/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete<Message>(`/products/${id}`).then((r) => r.data),
  setActive: (id: string, active: boolean) => api.post<Product>(`/products/${id}/${active ? 'activate' : 'deactivate'}`).then((r) => r.data),

  variants: (id: string) => api.get<Variant[]>(`/products/${id}/variants`).then((r) => r.data),
  createVariant: (id: string, body: VariantInput) => api.post<Variant>(`/products/${id}/variants`, body).then((r) => r.data),
  updateVariant: (variantId: string, body: Partial<VariantInput> & { is_active?: boolean }) =>
    api.patch<Variant>(`/products/variants/${variantId}`, body).then((r) => r.data),
  deleteVariant: (variantId: string) => api.delete<Message>(`/products/variants/${variantId}`).then((r) => r.data),
  setVariantActive: (variantId: string, active: boolean) =>
    api.post<Variant>(`/products/variants/${variantId}/${active ? 'activate' : 'deactivate'}`).then((r) => r.data),
  setStock: (variantId: string, stock: number) =>
    api.post<Variant>(`/products/variants/${variantId}/stock`, null, { params: { stock } }).then((r) => r.data),

  getShipping: (variantId: string) => api.get<ShippingData>(`/products/variants/${variantId}/shipping`).then((r) => r.data),
  saveShipping: (variantId: string, body: ShippingInput, exists: boolean) =>
    (exists ? api.patch<ShippingData>(`/products/variants/${variantId}/shipping`, body) : api.post<ShippingData>(`/products/variants/${variantId}/shipping`, body)).then((r) => r.data),

  uploadImage: (id: string, image: File, isCover = false) =>
    api.post<ProductImage>(`/products/${id}/images`, form({ image }), { params: { is_cover: isCover } }).then((r) => r.data),
  deleteImage: (imageId: string) => api.delete<Message>(`/products/images/${imageId}`).then((r) => r.data),
  setCover: (imageId: string) => api.post<ProductImage>(`/products/images/${imageId}/set-cover`).then((r) => r.data),
}

export const adminCategories = {
  list: () => api.get<Page<Category>>('/categories/', { params: { page_size: 100, active_only: false } }).then((r) => r.data.items),
  create: (category_name: string) => api.post<Category>('/categories/', { category_name }).then((r) => r.data),
  update: (id: string, body: { category_name?: string; is_active?: boolean }) => api.patch<Category>(`/categories/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete<Message>(`/categories/${id}`).then((r) => r.data),
  uploadImage: (id: string, image: File) => api.post<Category>(`/categories/${id}/image`, form({ image })).then((r) => r.data),
  removeImage: (id: string) => api.delete<Category>(`/categories/${id}/image`).then((r) => r.data),
}

export const adminReviews = {
  pending: () => api.get<ReviewPrivate[]>('/reviews/admin/pending').then((r) => r.data),
  authorized: () => api.get<ReviewPrivate[]>('/reviews/admin/authorized').then((r) => r.data),
  authorize: (id: string) => api.post<ReviewPrivate>(`/reviews/admin/${id}/authorize`).then((r) => r.data),
  revoke: (id: string) => api.post<ReviewPrivate>(`/reviews/admin/${id}/revoke`).then((r) => r.data),
}

export const adminCampaigns = {
  list: () => api.get<Page<Campaign>>('/campaigns/', { params: { page_size: 100, active_only: false } }).then((r) => r.data.items),
  create: (body: CampaignInput) => api.post<Campaign>('/campaigns/', body).then((r) => r.data),
  update: (id: string, body: Partial<CampaignInput> & { is_active?: boolean }) => api.patch<Campaign>(`/campaigns/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete<Message>(`/campaigns/${id}`).then((r) => r.data),
  setActive: (id: string, active: boolean) => api.post<Campaign>(`/campaigns/${id}/${active ? 'activate' : 'deactivate'}`).then((r) => r.data),
  images: (id: string) => api.get<CampaignImage[]>(`/campaigns/${id}/images`).then((r) => r.data),
  uploadImage: (id: string, image: File, isCover = false) =>
    api.post<CampaignImage>(`/campaigns/${id}/images`, form({ image }), { params: { is_cover: isCover } }).then((r) => r.data),
  deleteImage: (imageId: string) => api.delete<Message>(`/campaigns/images/${imageId}`).then((r) => r.data),
  setCover: (imageId: string) => api.post<CampaignImage>(`/campaigns/images/${imageId}/set-cover`).then((r) => r.data),
  updateImage: (imageId: string, body: { fit?: 'cover' | 'contain'; focus_x?: number; focus_y?: number; zoom?: number }) =>
    api.patch<CampaignImage>(`/campaigns/images/${imageId}`, body).then((r) => r.data),
}

export const adminContacts = {
  list: (params: { page?: number; page_size?: number; status?: ContactStatus; search?: string }) =>
    api.get<Page<Contact>>('/contact/', { params: clean(params) }).then((r) => r.data),
  setStatus: (id: string, status: ContactStatus) => api.patch<Contact>(`/contact/${id}`, { status }).then((r) => r.data),
  remove: (id: string) => api.delete<Message>(`/contact/${id}`).then((r) => r.data),
}

export const adminUsers = {
  list: (params: { page?: number; page_size?: number; search?: string; role?: string; is_active?: boolean }) =>
    api.get<Page<AdminUser>>('/admin/list-users', { params: clean(params) }).then((r) => r.data),
  setActive: (id: string, active: boolean) => api.post(`/auth/${active ? 'reactivate-user' : 'deactive-user'}/${id}`).then((r) => r.data),
}

export const adminProfile = {
  update: (full_name: string) => api.patch('/auth/update-admin-profile', { full_name }).then((r) => r.data),
  uploadPhoto: (photo: File) => api.post('/auth/upload-admin-photo', form({ photo })).then((r) => r.data),
  deletePhoto: () => api.delete('/auth/delete-admin-photo').then((r) => r.data),
}