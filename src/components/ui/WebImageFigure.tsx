import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import type { WebImage } from '../../types/content'
import { ImageCredit } from './ImageCredit'

interface WebImageFigureProps {
  image: WebImage
  /** Giá trị `sizes` của srcset, ví dụ "(min-width: 1024px) 30vw, 100vw" */
  sizes: string
  priority?: boolean
  showCaption?: boolean
  className?: string
}

/** Ảnh nhúng từ Wikimedia Commons, khung 4:3, luôn kèm dòng ghi nguồn (kể cả khi ảnh lỗi) */
export function WebImageFigure({ image, sizes, priority = false, showCaption = false, className = '' }: WebImageFigureProps) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className={`flex flex-col gap-1.5 ${className}`}>
      <div data-testid="web-image-frame" className="relative overflow-hidden rounded-2xl bg-line" style={{ aspectRatio: '4 / 3' }}>
        {failed ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
            <ImageOff aria-hidden className="size-8" />
            <span className="text-sm">Hình ảnh hiện không tải được</span>
          </div>
        ) : (
          <img
            src={image.src.url}
            srcSet={image.src.srcset.map((s) => `${s.url} ${s.width}w`).join(', ')}
            sizes={sizes}
            alt={image.alt}
            width={image.src.width}
            height={image.src.height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="size-full object-cover"
          />
        )}
      </div>
      <figcaption className="flex flex-col gap-0.5 leading-snug">
        {showCaption && <span className="text-sm">{image.caption}</span>}
        <ImageCredit image={image} />
      </figcaption>
    </figure>
  )
}
