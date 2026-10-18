import type { UUID } from './common'

export interface Campaign {
  campaign_id: UUID
  title: string
  description: string | null
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface CampaignImage {
  campaign_mage_id: UUID
  campaign_id: UUID
  image_url: string
  is_cover: boolean
  display_order: number
}

export interface ContactIn {
  full_name: string
  subject: string
  message: string
  email: string
  phone: string
}
