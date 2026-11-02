import rawManifest from '../data/image-manifest.json'

export interface ImageMeta {
  width: number
  height: number
  widths: number[]
  lqip: string
}

function isImageMeta(v: unknown): v is ImageMeta {
  if (typeof v !== 'object' || v === null) return false
  if (!('width' in v && 'height' in v && 'widths' in v && 'lqip' in v)) return false
  return (
    typeof v.width === 'number' &&
    typeof v.height === 'number' &&
    typeof v.lqip === 'string' &&
    Array.isArray(v.widths) &&
    v.widths.length > 0 &&
    v.widths.every((w: unknown) => typeof w === 'number')
  )
}

export function parseManifest(raw: unknown): Map<string, ImageMeta> {
  const map = new Map<string, ImageMeta>()
  if (typeof raw !== 'object' || raw === null) return map
  for (const [id, meta] of Object.entries(raw)) {
    if (isImageMeta(meta)) map.set(id, meta)
  }
  return map
}

const manifest = parseManifest(rawManifest)

export function getImageMeta(imageId: string): ImageMeta | undefined {
  return manifest.get(imageId)
}

export function imageSrcSet(imageId: string, widths: number[], format: 'avif' | 'webp'): string {
  return widths.map((w) => `${import.meta.env.BASE_URL}images/${imageId}-${w}.${format} ${w}w`).join(', ')
}
