import { LEGAL } from '@/lib/legal'

export interface LegalSection { title: string; body: string[] }

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-brand-950/60">{LEGAL.company} · Última atualização: {LEGAL.updatedAt}</p>
      <div className="mt-8 space-y-8">
        {sections.map((s, i) => (
          <section key={s.title} className="space-y-3">
            <h2 className="text-xl font-bold">{i + 1}. {s.title}</h2>
            {s.body.map((p) => <p key={p} className="leading-relaxed text-brand-950/80">{p}</p>)}
          </section>
        ))}
      </div>
    </article>
  )
}