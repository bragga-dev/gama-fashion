import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Check, ChevronRight, ShoppingBag } from 'lucide-react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { ShippingCalculator } from '@/components/product/ShippingCalculator'
import { ReviewList } from '@/components/product/ReviewList'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Alert, Badge, EmptyState, PageLoader, QuantityStepper } from '@/components/ui/misc'
import { useAuth } from '@/contexts/AuthContext'
import { useCartMutations } from '@/hooks/useCart'
import { useProduct, useProductReviews } from '@/hooks/useCatalog'
import { getErrorMessage } from '@/lib/errors'
import { GENDER_LABEL } from '@/lib/format'
import { formatBRL, installment } from '@/lib/money'
import { catalogService } from '@/services/catalog.service'

export default function ProductPage() {
  const { id } = useParams()
  const { data: product, isLoading, isError } = useProduct(id)
  const { data: reviews } = useProductReviews(id)
  const { isAuthenticated, isClient } = useAuth()
  const { add } = useCartMutations()
  const navigate = useNavigate()
  const location = useLocation()

  const [size, setSize] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const variants = useMemo(() => product?.variants.filter((v) => v.is_active) ?? [], [product])
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[]
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[]
  // Dimensão com uma única opção é pré-selecionada.
  const effSize = size ?? (sizes.length === 1 ? sizes[0] : null)
  const effColor = color ?? (colors.length === 1 ? colors[0] : null)

  const selected = variants.find((v) =>
    (!sizes.length || v.size === effSize) && (!colors.length || v.color === effColor))

  if (isLoading) return <PageLoader />
  if (isError || !product) {
    return <div className="mx-auto max-w-3xl px-4 py-16"><EmptyState title="Produto não encontrado" text="Ele pode ter sido removido ou está indisponível."
      action={<ButtonLink to="/produtos">Ver produtos</ButtonLink>} /></div>
  }

  const price = selected ? formatBRL(selected.price) : product.min_price === product.max_price || !product.max_price
    ? formatBRL(product.min_price) : `${formatBRL(product.min_price)} – ${formatBRL(product.max_price)}`
  const needsChoice = !selected
  const soldOut = !!selected && !selected.in_stock

  const handleAdd = async () => {
    setError(null)
    if (!isAuthenticated) return navigate('/entrar', { state: { from: location.pathname } })
    if (!isClient) return setError('Apenas contas de cliente podem comprar.')
    if (!selected) return
    try {
      await add.mutateAsync({ variantId: selected.variant_id, quantity: qty })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (e) { setError(getErrorMessage(e)) }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Você está em" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-brand-950/60">
        <Link to="/" className="hover:text-brand-700">Início</Link><ChevronRight className="size-3" />
        <Link to="/produtos" className="hover:text-brand-700">Produtos</Link><ChevronRight className="size-3" />
        <Link to={`/produtos?category=${product.category.product_category_id}`} className="hover:text-brand-700">{product.category.category_name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <ProductGallery images={product.images} alt={product.product_name} />

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2"><Badge>{GENDER_LABEL[product.gender] ?? product.gender}</Badge><Badge className="bg-white ring-1 ring-brand-200">{product.category.category_name}</Badge></div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{product.product_name}</h1>
            <div>
              <p className="text-3xl font-extrabold text-brand-800">{price}</p>
              {(selected ?? product.min_price) && (
                <p className="text-sm text-brand-950/60">ou 3x de {installment(selected?.price ?? product.min_price!)} sem juros · PIX e boleto</p>
              )}
            </div>
          </div>

          <VariantSelector variants={variants} size={effSize} color={effColor} onSize={(s) => { setSize(s); setQty(1) }} onColor={(c) => { setColor(c); setQty(1) }} />

          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, selected?.stock ?? 1)} disabled={needsChoice || soldOut} />
            <Button size="lg" className="min-w-56 flex-1" onClick={handleAdd} loading={add.isPending} disabled={needsChoice || soldOut}>
              {added ? <><Check className="size-5" /> Adicionado!</> : <><ShoppingBag className="size-5" /> {soldOut ? 'Esgotado' : needsChoice ? 'Escolha as opções' : 'Adicionar ao carrinho'}</>}
            </Button>
          </div>
          {selected && selected.in_stock && selected.stock <= 5 && <p className="text-sm font-semibold text-brand-700">Restam apenas {selected.stock} {selected.stock === 1 ? 'unidade' : 'unidades'}!</p>}
          {error && <Alert>{error}</Alert>}
          {added && <Alert tone="success">Produto no carrinho. <Link to="/carrinho" className="font-bold underline">Ver carrinho</Link></Alert>}

          {selected && <ShippingCalculator quote={(cep) => catalogService.quoteVariantShipping(selected.variant_id, cep, qty)} />}

          {product.description && (
            <div className="space-y-2 rounded-3xl border border-brand-100 p-5">
              <h2 className="font-bold">Descrição</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-brand-950/80">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16"><ReviewList reviews={reviews?.list ?? []} summary={reviews?.summary ?? null} /></div>
    </div>
  )
}
