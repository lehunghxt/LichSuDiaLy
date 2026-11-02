import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { getImageMeta, imageSrcSet } from '../../lib/images'
import type { ImageRef } from '../../types/content'

interface SmartImageProps {
  image: ImageRef
  /** Giá trị `sizes` của srcset, ví dụ "(min-width: 1024px) 50vw, 100vw" */
  sizes: string
  /** Ảnh nằm trong màn hình đầu tiên (hero): tải ngay, không lazy */
  priority?: boolean
  showCredit?: boolean
  className?: string
}

export function SmartImage({ image, sizes, priority = false, showCredit = false, className = '' }: SmartImageProps) {
  const meta = getImageMeta(image.imageId)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const frame = `relative overflow-hidden rounded-card bg-line ${className}`
  const aspectRatio = meta ? `${meta.width} / ${meta.height}` : '4 / 3'

  const body =
    !meta || failed ? (
      <div
        role="img"
        aria-label={image.alt}
        className={`${frame} flex flex-col items-center justify-center gap-2 text-muted`}
        style={{ aspectRatio }}
      >
        <ImageOff aria-hidden className="size-8" />
        <span className="text-sm">Hình ảnh đang được cập nhật</span>
      </div>
    ) : (
      <picture
        className={`${frame} block`}
        style={{
          aspectRatio,
          backgroundImage: loaded ? undefined : `url("${meta.lqip}")`,
          backgroundSize: 'cover',
        }}
      >
        <source type="image/avif" srcSet={imageSrcSet(image.imageId, meta.widths, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={imageSrcSet(image.imageId, meta.widths, 'webp')} sizes={sizes} />
        <img
          src={`${import.meta.env.BASE_URL}images/${image.imageId}-${meta.widths[0]}.webp`}
          alt={image.alt}
          width={meta.width}
          height={meta.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`size-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </picture>
    )

  if (!showCredit) return body
  return (
    <figure>
      {body}
      <figcaption className="mt-1 text-xs text-muted">
        Ảnh: {image.credit} ({image.license})
      </figcaption>
    </figure>
  )
}
