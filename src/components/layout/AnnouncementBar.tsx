import { useEffect, useState } from 'react'
import { Truck, CreditCard, QrCode } from 'lucide-react'

const MESSAGES = [
  { icon: Truck, text: 'Enviamos para todo o Brasil' },
  { icon: QrCode, text: 'Pague com PIX, boleto ou cartão' },
  { icon: CreditCard, text: 'Compra segura com cobrança pela Asaas' },
]

export function AnnouncementBar() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 4000)
    return () => clearInterval(t)
  }, [])
  const { icon: Icon, text } = MESSAGES[i]
  return (
    <div className="bg-brand-950 text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-xs font-medium">
        <Icon className="size-3.5 text-brand-300" />
        <span key={i} className="animate-fade">{text}</span>
      </div>
    </div>
  )
}
