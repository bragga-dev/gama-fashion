import { imageStyle, type ImageAdjust } from '@/lib/image-fit'

/** Imagem de banner com ajuste (preencher/ajustar, zoom e ponto de foco). Precisa de um pai `relative overflow-hidden`. */
export function BannerImage({ src, adjust, eager }: { src: string; adjust: ImageAdjust; eager?: boolean }) {
  return (
    <>
      {adjust.fit === 'contain' && (
        <img src={src} alt="" aria-hidden draggable={false} className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-2xl" />
      )}
      <img src={src} alt="" draggable={false} loading={eager ? 'eager' : 'lazy'} className="absolute inset-0 size-full" style={imageStyle(adjust)} />
    </>
  )
}