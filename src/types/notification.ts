import type { UUID } from './common'

export interface AppNotification {
  notification_id: UUID
  type: string
  title: string
  body: string
  action_url: string
  target_type: string
  target_id: UUID | null
  is_read: boolean
  read_at: string | null
  created_at: string
}
