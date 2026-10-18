import type { Decimal, UUID } from './common'

export type BillingType = 'BOLETO' | 'PIX' | 'CREDIT_CARD'

export type PaymentStatus =
  | 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED' | 'REFUND_IN_PROGRESS' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS' | 'CANCELLED'

export interface CreditCardIn {
  holder_name: string
  number: string
  expiry_month: string
  expiry_year: string
  ccv: string
}

export interface CreditCardHolderInfoIn {
  name: string
  email: string
  cpf_cnpj: string
  postal_code: string
  address_number: string
  phone?: string
}

export interface PaymentCreateIn {
  billing_type: BillingType
  credit_card?: CreditCardIn
  credit_card_holder_info?: CreditCardHolderInfoIn
}

export interface Payment {
  payment_id: UUID
  order_id: UUID
  asaas_payment_id: string | null
  value: Decimal
  billing_type: BillingType
  status: PaymentStatus
  due_date: string
  description: string
  invoice_url: string | null
  bank_slip_url: string | null
  pix_qr_code: string | null
  pix_copy_paste: string | null
  payment_date: string | null
  net_value: Decimal | null
  created_at: string
}

export const PAID_STATUSES: PaymentStatus[] = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']
