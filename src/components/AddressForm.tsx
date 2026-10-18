import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { applyFieldErrors, formLevelMessage } from '@/lib/errors'
import { BR_STATES, maskCep, onlyDigits } from '@/lib/format'
import type { Address, AddressIn } from '@/types/address'

const schema = z.object({
  cep: z.string().refine((v) => onlyDigits(v).length === 8, 'CEP deve ter 8 dígitos'),
  street: z.string().min(2, 'Informe a rua'),
  number: z.string().min(1, 'Informe o número'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Informe o bairro'),
  city: z.string().min(2, 'Informe a cidade'),
  state: z.string().min(2, 'Selecione o estado'),
})
type Values = z.infer<typeof schema>

interface Props {
  initial?: Address
  submitLabel?: string
  onSubmit: (data: AddressIn) => Promise<unknown>
  onCancel?: () => void
}

export function AddressForm({ initial, submitLabel = 'Salvar endereço', onSubmit, onCancel }: Props) {
  const [formError, setFormError] = useState<string | null>(null)
  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: initial ? {
      cep: initial.cep, street: initial.street, number: initial.number, complement: initial.complement,
      neighborhood: initial.neighborhood, city: initial.city, state: initial.state,
    } : { state: '' },
  })

  const submit = handleSubmit(async (v) => {
    setFormError(null)
    try {
      await onSubmit({ ...v, complement: v.complement ?? '', country: 'Brasil' })
    } catch (e) {
      if (!applyFieldErrors(e, setError)) setFormError(formLevelMessage(e))
    }
  })

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-6" noValidate>
      <Input className="sm:col-span-2" label="CEP" inputMode="numeric" placeholder="00000-000" error={errors.cep?.message}
        {...register('cep', { onChange: (e) => setValue('cep', maskCep(e.target.value)) })} />
      <Input className="sm:col-span-4" label="Rua" error={errors.street?.message} {...register('street')} />
      <Input className="sm:col-span-2" label="Número" error={errors.number?.message} {...register('number')} />
      <Input className="sm:col-span-4" label="Complemento (opcional)" error={errors.complement?.message} {...register('complement')} />
      <Input className="sm:col-span-3" label="Bairro" error={errors.neighborhood?.message} {...register('neighborhood')} />
      <Input className="sm:col-span-2" label="Cidade" error={errors.city?.message} {...register('city')} />
      <Select className="sm:col-span-1" label="UF" error={errors.state?.message} {...register('state')}>
        <option value="">UF</option>
        {BR_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      {formError && <Alert className="sm:col-span-6">{formError}</Alert>}
      <div className="flex gap-3 sm:col-span-6">
        <Button type="submit" loading={isSubmitting}>{submitLabel}</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancelar</Button>}
      </div>
    </form>
  )
}
