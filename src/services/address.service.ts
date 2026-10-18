import { api } from '@/lib/api'
import type { Address, AddressIn } from '@/types/address'

export const addressService = {
  list: () => api.get<Address[]>('/address/my-addresses').then((r) => r.data),
  create: (body: AddressIn) => api.post<Address>('/address/my-addresses', body).then((r) => r.data),
  update: (id: string, body: Partial<AddressIn>) =>
    api.patch<Address>(`/address/my-addresses/${id}`, body).then((r) => r.data),
  remove: (id: string) => api.delete(`/address/my-addresses/${id}`).then((r) => r.data),
  setPreferential: (id: string) =>
    api.post<Address>(`/address/my-addresses/${id}/set-preferential`).then((r) => r.data),
}
