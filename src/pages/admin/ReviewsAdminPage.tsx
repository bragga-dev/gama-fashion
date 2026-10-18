import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Undo2 } from 'lucide-react'
import { Card, PageHeader, Pill, Tabs } from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Alert, PageLoader, StarRating } from '@/components/ui/misc'
import { getErrorMessage } from '@/lib/errors'
import { formatDate, lineTitle, variantInfo } from '@/lib/format'
import { adminReviews } from '@/services/admin.service'

export default function ReviewsAdminPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'pending' | 'authorized'>('pending')
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'reviews', tab], queryFn: tab === 'pending' ? adminReviews.pending : adminReviews.authorized })
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }) }
  const authorize = useMutation({ mutationFn: (id: string) => adminReviews.authorize(id), onSuccess: refresh })
  const revoke = useMutation({ mutationFn: (id: string) => adminReviews.revoke(id), onSuccess: refresh })
  const error = authorize.error ?? revoke.error

  return (
    <>
      <PageHeader title="Avaliações" subtitle="Somente as autorizadas aparecem na loja" />
      <Tabs value={tab} onChange={setTab} tabs={[{ id: 'pending', label: 'Pendentes' }, { id: 'authorized', label: 'Autorizadas' }]} />
      {error && <Alert className="mb-4">{getErrorMessage(error)}</Alert>}
      {isLoading ? <PageLoader /> : !data?.length ? <Card><p className="text-center text-sm text-brand-950/60">Nenhuma avaliação {tab === 'pending' ? 'pendente' : 'autorizada'}.</p></Card> : (
        <ul className="grid gap-4 lg:grid-cols-2">{data.map((r) => (
          <li key={r.reviews_id}><Card className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-bold">{lineTitle(r.order_item.variant)}</p><p className="text-xs text-brand-950/60">{variantInfo(r.order_item.variant)}</p></div>
              <Pill tone={r.is_authorized ? 'green' : 'amber'}>{r.is_authorized ? 'Autorizada' : 'Pendente'}</Pill>
            </div>
            <StarRating value={r.reviews} />
            <p className="text-sm">{r.comment || <span className="text-brand-950/50">Sem comentário.</span>}</p>
            <p className="text-xs text-brand-950/60">{r.user.email} · {formatDate(r.created_at)}</p>
            {r.is_authorized
              ? <Button size="sm" variant="outline" loading={revoke.isPending} onClick={() => revoke.mutate(r.reviews_id)}><Undo2 className="size-4" /> Revogar</Button>
              : <Button size="sm" loading={authorize.isPending} onClick={() => authorize.mutate(r.reviews_id)}><Check className="size-4" /> Autorizar</Button>}
          </Card></li>))}</ul>)}
    </>
  )
}