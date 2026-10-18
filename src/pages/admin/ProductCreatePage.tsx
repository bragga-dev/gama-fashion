import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Star, X } from 'lucide-react'
import { Card, PageHeader } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Alert } from '@/components/ui/misc'
import { useCategories } from '@/hooks/useCatalog'
import { cn } from '@/lib/cn'
import { applyFieldErrors, formLevelMessage } from '@/lib/errors'
import { COLOR_LABEL, SIZE_ORDER } from '@/lib/format'
import { adminProducts } from '@/services/admin.service'

const num = (label: string) => z.string().min(1, `${label} obrigatório`).refine((v) => Number(v.replace(',', '.')) > 0, `${label} deve ser maior que zero`)
const schema = z.object({
  product_name: z.string().min(2, 'Informe o nome'),
  product_category_id: z.string().min(1, 'Selecione a categoria'),
  gender: z.string().min(1, 'Selecione o gênero'),
  description: z.string().optional(),
  size: z.string().optional(), color: z.string().optional(), sku: z.string().optional(),
  price: z.string().min(1, 'Informe o preço').refine((v) => Number(v.replace(',', '.')) >= 0, 'Preço inválido'),
  stock: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'Estoque inválido'),
  weight: num('Peso'), height: num('Altura'), width: num('Largura'), length: num('Comprimento'),
})
type Values = z.infer<typeof schema>
const dec = (v: string) => v.replace(',', '.')

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: categories } = useCategories()
  const [images, setImages] = useState<File[]>([])
  const [cover, setCover] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema), defaultValues: { stock: '0', gender: '' },
  })

  const submit = handleSubmit(async (v) => {
    setError(null)
    try {
      const product = await adminProducts.createFull({
        product_name: v.product_name, product_category_id: v.product_category_id, gender: v.gender, description: v.description ?? '',
        variant: { sku: v.sku || null, size: v.size || null, color: v.color || null, price: dec(v.price), stock: Number(v.stock) },
        shipping: { weight: dec(v.weight), height: dec(v.height), width: dec(v.width), length: dec(v.length), quantity: 1 },
      }, images, cover)
      await qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      navigate(`/painel/produtos/${product.product_id}`, { replace: true })
    } catch (e) {
      if (!applyFieldErrors(e, setFieldError)) setError(formLevelMessage(e))
    }
  })

  const previews = images.map((f) => URL.createObjectURL(f))

  return (
    <>
      <Link to="/painel/produtos" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"><ChevronLeft className="size-4" /> Produtos</Link>
      <PageHeader title="Novo produto" subtitle="Cria o produto, a 1ª variante, o frete e as fotos de uma vez. Outras variantes entram depois na edição." />
      <form onSubmit={submit} noValidate className="space-y-6">
        <Card className="grid gap-4 sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">Dados do produto</h2>
          <Input className="sm:col-span-2" label="Nome" error={errors.product_name?.message} {...register('product_name')} />
          <Select label="Categoria" error={errors.product_category_id?.message} {...register('product_category_id')}>
            <option value="">Selecione</option>{categories?.map((c) => <option key={c.product_category_id} value={c.product_category_id}>{c.category_name}</option>)}
          </Select>
          <Select label="Gênero" error={errors.gender?.message} {...register('gender')}>
            <option value="">Selecione</option><option value="feminino">Feminino</option><option value="masculino">Masculino</option><option value="unissex">Unissex</option>
          </Select>
          <Textarea className="sm:col-span-2" label="Descrição" {...register('description')} />
        </Card>

        <Card className="grid gap-4 sm:grid-cols-5">
          <h2 className="font-bold sm:col-span-5">Primeira variante</h2>
          <Select label="Tamanho" {...register('size')}><option value="">Único</option>{SIZE_ORDER.map((s) => <option key={s}>{s}</option>)}</Select>
          <Select label="Cor" {...register('color')}><option value="">Sem cor</option>{Object.entries(COLOR_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
          <Input label="SKU" {...register('sku')} />
          <Input label="Preço (R$)" inputMode="decimal" error={errors.price?.message} {...register('price')} />
          <Input label="Estoque" inputMode="numeric" error={errors.stock?.message} {...register('stock')} />
        </Card>

        <Card className="grid gap-4 sm:grid-cols-4">
          <h2 className="font-bold sm:col-span-4">Embalagem (cálculo do frete)</h2>
          <Input label="Peso (kg)" inputMode="decimal" error={errors.weight?.message} {...register('weight')} />
          <Input label="Altura (cm)" inputMode="decimal" error={errors.height?.message} {...register('height')} />
          <Input label="Largura (cm)" inputMode="decimal" error={errors.width?.message} {...register('width')} />
          <Input label="Comprimento (cm)" inputMode="decimal" error={errors.length?.message} {...register('length')} />
        </Card>

        <Card className="space-y-4">
          <h2 className="font-bold">Fotos</h2>
          <input type="file" accept="image/*" multiple onChange={(e) => { setImages(Array.from(e.target.files ?? [])); setCover(0) }}
            className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-brand-100 file:px-5 file:py-2.5 file:font-semibold file:text-brand-800 hover:file:bg-brand-200" />
          {images.length > 0 && (
            <ul className="flex flex-wrap gap-3">{previews.map((src, i) => (
              <li key={src} className={cn('relative size-24 overflow-hidden rounded-2xl border-2', i === cover ? 'border-brand-700' : 'border-brand-100')}>
                <img src={src} alt="" className="size-full object-cover" />
                <button type="button" aria-label="Definir como capa" onClick={() => setCover(i)} className={cn('absolute left-1 top-1 flex size-7 items-center justify-center rounded-full', i === cover ? 'bg-brand-700 text-white' : 'bg-white/90 text-brand-700')}><Star className="size-3.5" /></button>
                <button type="button" aria-label="Remover" onClick={() => { setImages(images.filter((_, n) => n !== i)); setCover(0) }} className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-white/90 text-red-600"><X className="size-3.5" /></button>
              </li>))}</ul>
          )}
          <p className="text-xs text-brand-950/60">A estrela marca a foto de capa.</p>
        </Card>

        {error && <Alert>{error}</Alert>}
        <Button type="submit" size="lg" loading={isSubmitting}>Criar produto</Button>
      </form>
    </>
  )
}