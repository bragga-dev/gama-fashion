import { Link } from 'react-router-dom'
import logoDark from '@/assets/logo/logo-horizontal.png'
import logoLight from '@/assets/logo/logo-horizontal-light.png'
import { cn } from '@/lib/cn'

/** `light` = versão para fundos escuros (roxo escuro vira branco). */
export function Logo({ className, imgClassName, light }: { className?: string; imgClassName?: string; light?: boolean }) {
  return (
    <Link to="/" aria-label="Gama Fashion - Moda Fitness" className={cn('inline-flex items-center', className)}>
      <img src={light ? logoLight : logoDark} alt="Gama Fashion - Moda Fitness" width={1100} height={280} className={cn('h-11 w-auto sm:h-12', imgClassName)} />
    </Link>
  )
}