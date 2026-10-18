import { ButtonLink } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-brand-100 text-4xl font-extrabold text-brand-700">404</span>
      <h1 className="text-2xl font-extrabold">Página não encontrada</h1>
      <p className="text-brand-950/70">O endereço que você tentou acessar não existe ou foi movido.</p>
      <ButtonLink to="/" size="lg">Voltar à loja</ButtonLink>
    </div>
  )
}
