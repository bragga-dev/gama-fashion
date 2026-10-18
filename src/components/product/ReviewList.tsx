import { StarRating } from '@/components/ui/misc'
import { formatDate } from '@/lib/format'
import type { RatingSummary, Review } from '@/types/review'

export function ReviewList({ reviews, summary }: { reviews: Review[]; summary: RatingSummary | null }) {
  const avg = summary ? Number(summary.average_rating) : 0
  return (
    <section aria-labelledby="reviews-title" className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 id="reviews-title" className="text-2xl font-extrabold">Avaliações</h2>
        {summary && summary.total_reviews > 0 && (
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5">
            <StarRating value={avg} />
            <span className="text-sm font-bold">{avg.toFixed(1)}</span>
            <span className="text-xs text-brand-950/60">({summary.total_reviews})</span>
          </div>
        )}
      </div>
      {!reviews.length
        ? <p className="rounded-3xl bg-brand-50 p-6 text-sm text-brand-950/70">Este produto ainda não tem avaliações.</p>
        : <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.reviews_id} className="space-y-2 rounded-3xl border border-brand-100 p-5">
                <div className="flex items-center justify-between"><StarRating value={r.reviews} /><time className="text-xs text-brand-950/50">{formatDate(r.created_at)}</time></div>
                {r.comment && <p className="text-sm leading-relaxed">{r.comment}</p>}
                <p className="text-xs font-semibold text-brand-600">Cliente verificado</p>
              </li>
            ))}
          </ul>}
    </section>
  )
}
