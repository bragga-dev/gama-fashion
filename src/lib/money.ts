import Decimal from 'decimal.js'
import type { Decimal as DecimalString } from '@/types/common'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Valores monetários chegam como string ("199.90"): nunca faça conta com float. */
export function toDecimal(value: DecimalString | number | null | undefined): Decimal {
  if (value === null || value === undefined || value === '') return new Decimal(0)
  return new Decimal(value)
}

export function formatBRL(value: DecimalString | number | null | undefined): string {
  return brl.format(toDecimal(value).toDecimalPlaces(2).toNumber())
}

/** Valor da parcela (sem juros) — apenas apresentação. */
export function installment(value: DecimalString, times = 3): string {
  return formatBRL(toDecimal(value).div(times).toString())
}
