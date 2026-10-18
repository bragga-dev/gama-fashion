import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Barcode, Check, Copy, CreditCard, ExternalLink, QrCode } from 'lucide-react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Checkbox, Input } from '@/components/ui/Field'
import { Alert, EmptyState, PageLoader } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { useAddresses, useOrder, useOrderPayments } from '@/hooks/useAccount'
import { cn } from '@/lib/cn'
import { applyFieldErrors, formLevelMessage } from '@/lib/errors'
import { formatDate, maskCardNumber, maskCpf, onlyDigits } from '@/lib/format'
import { formatBRL } from '@/lib/money'
import { safeExternalUrl } from '@/lib/safe-url'
import { paymentService } from '@/services/order.service'
import { PAID_STATUSES, type BillingType, type Payment } from '@/types/payment'
import { useForm } from 'react-hook-form'

const METHODS: { id: BillingType; label: string; icon: typeof QrCode; hint: string }[] = [
  { id: 'PIX', label: 'PIX', icon: QrCode, hint: 'Aprovação na hora' },
  { id: 'BOLETO', label: 'Boleto', icon: Barcode, hint: 'Compensa em até 3 dias úteis' },
  { id: 'CREDIT_CARD', label: 'Cartão', icon: CreditCard, hint: 'Crédito à vista' },
]

interface CardValues { holder_name: string; number: string; expiry_month: string; expiry_year: string; ccv: string; cpf: string; phone: string; accept: boolean }

function CardForm({ onSubmit }: { onSubmit: (v: CardValues) => Promise<void> }) {
  const [formError, setFormError] = useState<string | null>(null)
  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<CardValues>()
  const go = handleSubmit(async (v) => {
    setFormError(null)
    try { await onSubmit(v) } catch (e) { if (!applyFieldErrors(e, setError)) setFormError(formLevelMessage(e)) }
  })
  const req = { required: 'Obrigatório' }
  return (
    <form onSubmit={go} className="grid gap-4 sm:grid-cols-6" noValidate>
      <Input className="sm:col-span-6" label="Nome impresso no cartão" autoComplete="cc-name" error={errors.holder_name?.message} {...register('holder_name', req)} />
      <Input className="sm:col-span-6" label="Número do cartão" inputMode="numeric" autoComplete="cc-number" error={errors.number?.message}
        {...register('number', { ...req, minLength: { value: 13, message: 'Número inválido' }, onChange: (e) => setValue('number', maskCardNumber(e.target.value)) })} />
      <Input className="sm:col-span-2" label="Mês (MM)" inputMode="numeric" maxLength={2} autoComplete="cc-exp-month" error={errors.expiry_month?.message} {...register('expiry_month', req)} />
      <Input className="sm:col-span-2" label="Ano (AAAA)" inputMode="numeric" maxLength={4} autoComplete="cc-exp-year" error={errors.expiry_year?.message} {...register('expiry_year', req)} />
      <Input className="sm:col-span-2" label="CVV" inputMode="numeric" maxLength={4} autoComplete="cc-csc" error={errors.ccv?.message} {...register('ccv', req)} />
      <Input className="sm:col-span-3" label="CPF do titular" inputMode="numeric" error={errors.cpf?.message}
        {...register('cpf', { ...req, onChange: (e) => setValue('cpf', maskCpf(e.target.value)) })} />
      <Input className="sm:col-span-3" label="Telefone (opcional)" inputMode="tel" {...register('phone')} />
      <Checkbox className="sm:col-span-6" label="Confirmo que sou o titular do cartão." error={errors.accept?.message} {...register('accept', { required: 'Confirme para continuar' })} />
      {formError && <Alert className="sm:col-span-6">{formError}</Alert>}
      <Button type="submit" size="lg" className="sm:col-span-6" loading={isSubmitting}>Pagar com cartão</Button>
    </form>
  )
}

function PixBox({ payment }: { payment: Payment }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!payment.pix_copy_paste) return
    await navigator.clipboard.writeText(payment.pix_copy_paste)
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }
  return (
    <div className="space-y-4 text-center">
      <p className="font-bold">Escaneie o QR Code ou copie o código PIX</p>
      {payment.pix_qr_code && <img src={`data:image/png;base64,${payment.pix_qr_code}`} alt="QR Code PIX" className="mx-auto size-56 rounded-3xl border border-brand-100 p-3" />}
      {payment.pix_copy_paste && (
        <>
          <p className="mx-auto max-w-md break-all rounded-2xl bg-brand-50 p-3 text-left text-xs">{payment.pix_copy_paste}</p>
          <Button onClick={copy} variant="secondary">{copied ? <><Check className="size-4" /> Copiado!</> : <><Copy className="size-4" /> Copiar código</>}</Button>
        </>
      )}
      <p className="text-xs text-brand-950/60">Válido até {formatDate(payment.due_date)}. Esta página atualiza sozinha quando o pagamento for confirmado.</p>
    </div>
  )
}

export default function OrderPaymentPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { me } = useAuth()
  const { data: order, isLoading } = useOrder(id)
  const { data: addresses } = useAddresses()
  const [method, setMethod] = useState<BillingType>('PIX')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const pending = order?.order_status === 'PENDING'
  const { data: payments } = useOrderPayments(id, pending)
  const active = payments?.find((p) => !['CANCELLED', 'REFUNDED', 'OVERDUE'].includes(p.status))
  const paid = !!active && PAID_STATUSES.includes(active.status)

  if (isLoading) return <PageLoader />
  if (!order) return <div className="mx-auto max-w-2xl px-4 py-16"><EmptyState title="Pedido não encontrado" action={<ButtonLink to="/painel/meus-pedidos">Meus pedidos</ButtonLink>} /></div>

  const address = addresses?.find((a) => a.address_id === order.shipping_address_id)

  const create = async (card?: CardValues) => {
    if (card && !address) throw new Error('Não encontramos o endereço do pedido para validar o cartão.')
    setCreating(true); setError(null)
    try {
      await paymentService.create(order.order_id, card ? {
        billing_type: 'CREDIT_CARD',
        credit_card: { holder_name: card.holder_name, number: onlyDigits(card.number), expiry_month: card.expiry_month.padStart(2, '0'), expiry_year: card.expiry_year, ccv: card.ccv },
        credit_card_holder_info: {
          name: card.holder_name, email: me?.user.email ?? '', cpf_cnpj: onlyDigits(card.cpf),
          postal_code: onlyDigits(address?.cep ?? ''), address_number: address?.number ?? '', phone: onlyDigits(card.phone ?? '') || undefined,
        },
      } : { billing_type: method })
      await Promise.all([qc.invalidateQueries({ queryKey: ['payments', id] }), qc.invalidateQueries({ queryKey: ['orders'] })])
    } catch (e) {
      if (card) throw e
      setError(formLevelMessage(e))
    } finally { setCreating(false) }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold text-brand-600">Pedido {order.code}</p>
        <h1 className="text-3xl font-extrabold">{paid || order.order_status === 'COMPLETED' ? 'Pagamento confirmado! 🎉' : 'Pagamento'}</h1>
        <p className="mt-1 text-brand-950/70">Total: <strong>{formatBRL(order.total_geral)}</strong></p>
      </div>

      <div className="space-y-6 rounded-[2rem] border border-brand-100 p-6 sm:p-8">
        {paid || order.order_status === 'COMPLETED' ? (
          <div className="space-y-4 text-center">
            <p>Recebemos seu pagamento. Acompanhe o envio pelos seus pedidos.</p>
            <ButtonLink to={`/painel/meus-pedidos/${order.order_id}`} size="lg">Acompanhar pedido</ButtonLink>
          </div>
        ) : order.order_status !== 'PENDING' ? (
          <Alert tone="info">Este pedido está como “{order.order_status_label}”. Não é possível gerar novo pagamento.</Alert>
        ) : active ? (
          <div className="space-y-5">
            {active.billing_type === 'PIX' && <PixBox payment={active} />}
            {active.billing_type === 'BOLETO' && (
              <div className="space-y-4 text-center">
                <p className="font-bold">Boleto gerado</p>
                <p className="text-sm text-brand-950/70">Vencimento em {formatDate(active.due_date)}.</p>
                {safeExternalUrl(active.bank_slip_url) && <a href={safeExternalUrl(active.bank_slip_url)!} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-700 px-6 text-sm font-semibold text-white hover:bg-brand-800"><ExternalLink className="size-4" /> Abrir boleto</a>}
              </div>
            )}
            {active.billing_type === 'CREDIT_CARD' && <Alert tone="info">Pagamento no cartão em análise ({active.status}). Esta página atualiza sozinha.</Alert>}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Forma de pagamento">
              {METHODS.map(({ id: mid, label, icon: Icon, hint }) => (
                <button key={mid} role="radio" aria-checked={method === mid} onClick={() => setMethod(mid)}
                  className={cn('flex flex-col items-center gap-1.5 rounded-3xl border-2 p-4 text-center transition', method === mid ? 'border-brand-700 bg-brand-50' : 'border-brand-100 hover:border-brand-300')}>
                  <span className={cn('flex size-11 items-center justify-center rounded-full', method === mid ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-700')}><Icon className="size-5" /></span>
                  <span className="font-bold">{label}</span><span className="text-xs text-brand-950/60">{hint}</span>
                </button>
              ))}
            </div>
            {method === 'CREDIT_CARD'
              ? <CardForm onSubmit={create} />
              : <>{error && <Alert>{error}</Alert>}<Button size="lg" className="w-full" loading={creating} onClick={() => create()}>{method === 'PIX' ? 'Gerar QR Code PIX' : 'Gerar boleto'}</Button></>}
          </>
        )}
      </div>
      <p className="mt-6 text-center text-sm"><Link to="/painel/meus-pedidos" className="font-semibold text-brand-700 hover:underline">Ver todos os pedidos</Link></p>
    </div>
  )
}