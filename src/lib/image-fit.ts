import type { CSSProperties } from 'react'

export interface ImageAdjust {
  fit: 'cover' | 'contain'
  focus_x: number
  focus_y: number
  zoom: number
}

export const DEFAULT_ADJUST: ImageAdjust = { fit: 'cover', focus_x: 50, focus_y: 50, zoom: 1 }

export const adjustOf = (i?: Partial<ImageAdjust> | null): ImageAdjust => ({
  fit: i?.fit === 'contain' ? 'contain' : 'cover',
  focus_x: i?.focus_x ?? 50,
  focus_y: i?.focus_y ?? 50,
  zoom: i?.zoom ?? 1,
})

export function imageStyle(a: ImageAdjust): CSSProperties {
  const pos = `${a.focus_x}% ${a.focus_y}%`
  return { objectFit: a.fit, objectPosition: pos, transform: a.zoom !== 1 ? `scale(${a.zoom})` : undefined, transformOrigin: pos }
}