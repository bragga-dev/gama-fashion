import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { ProductGrid } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { EmptyState, Pagination } from '@/components/ui/misc'
import { useCategories, useProducts } from '@/hooks/useCatalog'
import { cn } from '@/lib/cn'
import { COLOR_HEX, COLOR_LABEL, GENDER_LABEL, SIZE_ORDER } from '@/lib/format'
import type { Gender, ProductFilters } from '@/types/product'

const PAGE_SIZE = 12
const chip = (active: boolean) =>
  cn('rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition', active ? 'border-brand-700 bg-brand-700 text-white' : 'border-brand-200 hover:border-brand-500')

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { data: categories } = useCategories()

  const filters: ProductFilters = useMemo(() => ({
    page: Number(params.get('page') ?? 1) || 1,
    page_size: PAGE_SIZE,
    search: params.get('search') ?? undefined,
    product_category_id: params.get('category') ?? undefined,
    gender: (params.get('gender') as Gender | null) ?? undefined,
    size: params.get('size') ?? undefined,
    color: params.get('color') ?? undefined,
    in_stock_only: params.get('stock') === '1',
    sort: params.get('sort') === 'recent' ? 'recent' : undefined,
  }), [params])

  const { data, isLoading, isFetching, isError } = useProducts(filters)

  const set = (key: string, value?: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }
  const toggle = (key: string, value: string) => set(key, params.get(key) === value ? null : value)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [filters.page])

  const activeCount = ['category', 'gender', 'size', 'color', 'stock'].filter((k) => params.get(k)).length
  const category = categories?.find((c) => c.product_category_id === filters.product_category_id)
  const title = filters.search ? `Resultados para “${filters.search}”` : category?.category_name
    ?? (filters.gender ? GENDER_LABEL[filters.gender] : filters.sort === 'recent' ? 'Novidades' : 'Todos os produtos')

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">Gênero</h3>
        <div className="flex flex-wrap gap-2">
          {(['feminino', 'masculino', 'unissex'] as const).map((g) => <button key={g} className={chip(filters.gender === g)} onClick={() => toggle('gender', g)}>{GENDER_LABEL[g]}</button>)}
        </div>
      </div>
      {!!categories?.length && (
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">Categoria</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => <button key={c.product_category_id} className={chip(filters.product_category_id === c.product_category_id)} onClick={() => toggle('category', c.product_category_id)}>{c.category_name}</button>)}
          </div>
        </div>
      )}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">Tamanho</h3>
        <div className="flex flex-wrap gap-2">
          {SIZE_ORDER.slice(0, 6).concat(SIZE_ORDER.slice(12, 20)).map((s) => <button key={s} className={chip(filters.size === s)} onClick={() => toggle('size', s)}>{s}</button>)}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-600">Cor</h3>
        <div className="flex flex-wrap gap-2.5">
          {Object.keys(COLOR_LABEL).map((c) => (
            <button key={c} title={COLOR_LABEL[c]} aria-label={COLOR_LABEL[c]} aria-pressed={filters.color === c} onClick={() => toggle('color', c)}
              className={cn('size-9 rounded-full border-2 p-0.5 transition', filters.color === c ? 'border-brand-700 ring-4 ring-brand-100' : 'border-brand-200 hover:border-brand-400')}>
              <span className="block size-full rounded-full border border-black/10" style={{ backgroundColor: COLOR_HEX[c] }} />
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
        <input type="checkbox" className="size-5 rounded-full accent-brand-700" checked={!!filters.in_stock_only} onChange={(e) => set('stock', e.target.checked ? '1' : null)} />
        Somente em estoque
      </label>
      {activeCount > 0 && <Button variant="ghost" size="sm" onClick={() => setParams(params.get('search') ? { search: params.get('search')! } : {}, { replace: true })}><X className="size-4" /> Limpar filtros</Button>}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {data && <p className="mt-1 text-sm text-brand-950/60">{data.total} {data.total === 1 ? 'produto' : 'produtos'}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Select aria-label="Ordenar" className="w-48" value={filters.sort ?? ''} onChange={(e) => set('sort', e.target.value || null)}>
            <option value="">Nome (A–Z)</option>
            <option value="recent">Mais recentes</option>
          </Select>
          <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal className="size-4" /> Filtros{activeCount > 0 && ` (${activeCount})`}</Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block">{filterPanel}</aside>
        <div className={cn('space-y-10 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
          {isError ? <EmptyState title="Não foi possível carregar os produtos" text="Tente novamente em instantes." />
            : !isLoading && !data?.items.length
              ? <EmptyState title="Nenhum produto encontrado" text="Ajuste os filtros ou tente outra busca." />
              : <ProductGrid products={data?.items} loading={isLoading} count={PAGE_SIZE} />}
          {data && <Pagination page={data.page} pages={data.pages} onChange={(p) => set('page', String(p))} />}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-white p-6">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-extrabold">Filtros</h2>
              <Button variant="ghost" size="sm" onClick={() => setFiltersOpen(false)}><X className="size-4" /> Fechar</Button></div>
            {filterPanel}
            <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>Ver {data?.total ?? ''} produtos</Button>
          </div>
        </div>
      )}
    </div>
  )
}

