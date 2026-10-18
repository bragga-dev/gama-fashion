import { api } from '@/lib/api'
import type { Message } from '@/types/common'
import type { ClientProfile, ClientUpdateIn, Me, RegisterIn } from '@/types/user'

type Access = { access: string }

export const authService = {
  login: (body: { email: string; password: string }) => api.post<Access>('/auth/login', body).then((r) => r.data),
  register: (body: RegisterIn) => api.post<Access>('/auth/register', body).then((r) => r.data),
  google: (body: { id_token: string; accepted_terms?: boolean; marketing_opt_in?: boolean }) =>
    api.post<Access>('/auth/google', body).then((r) => r.data),
  logout: () => api.post<Message>('/auth/logout').then((r) => r.data),
  logoutAll: () => api.post<Message>('/auth/logout-all').then((r) => r.data),
  me: () => api.get<Me>('/auth/me').then((r) => r.data),
  requestPasswordReset: (email: string) =>
    api.post<Message>('/auth/password-reset/request', { email }).then((r) => r.data),
  confirmPasswordReset: (body: { uid: string; token: string; new_password: string; new_password2: string }) =>
    api.post<Message>('/auth/password-reset/confirm', body).then((r) => r.data),
  resendVerification: (email: string) =>
    api.post<Message>('/auth/resend-verification', { email }).then((r) => r.data),
  changePassword: (body: { old_password: string; new_password: string; new_password2: string }) =>
    api.post<Access>('/auth/change-password', body).then((r) => r.data),
  updateClientProfile: (body: ClientUpdateIn) =>
    api.patch<{ client_id: string } & ClientProfile>('/auth/update-client-profile', body).then((r) => r.data),
  uploadClientPhoto: (photo: File) => {
    const form = new FormData()
    form.append('photo', photo)
    return api.post('/auth/upload-client-photo', form).then((r) => r.data)
  },
  deleteClientPhoto: () => api.delete('/auth/delete-client-photo').then((r) => r.data),
}
