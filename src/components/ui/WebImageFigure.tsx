import { ImageOff, Info, Maximize2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { WebImage } from '../../types/content'
import { ImageCredit } from './ImageCredit'
import { ImageSkeleton } from './ImageSkeleton'
import { markIfComplete } from './imageLoad'
import { ImageViewer } from './ImageViewer'

interface WebImageFigureProps {
  image: WebImage
  /** Giá trị `sizes` của srcset, ví dụ "(min-width: 1024px) 30vw, 100vw" */
  sizes: string
  priority?: boolean
  showCaption?: boolean
  /** Chú thích tối đa 2 dòng (chỗ hẹp); bản đầy đủ có khi xem ảnh lớn. Dòng ghi nguồn luôn hiện đủ */
  clampCaption?: boolean
  /** compact: ghi nguồn thu vào nút nhỏ "Nguồn ảnh", bấm mới mở (ảnh nhỏ xếp dày, ví dụ dải cây trồng).
   *  Bản đầy đủ vẫn có khi xem ảnh lớn và ở trang Nguồn ảnh */
  credit?: 'full' | 'compact'
  /** Tỉ lệ khung, mặc định 4 / 3 */
  aspect?: string
  className?: string
}

/** Ảnh nhúng từ Wikimedia Commons, khung 4:3, luôn kèm dòng ghi nguồn (kể cả khi ảnh lỗi); nhấn vào để xem toàn màn hình */
export function WebImageFigure({
  image,
  sizes,
  priority = false,
  showCaption = false,
  clampCaption = false,
  credit = 'full',
  aspect = '4 / 3',
  className = '',
}: WebImageFigureProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [viewing, setViewing] = useState(false)
  const openRef = useRef<HTMLButtonElement>(null)
  const closeViewer = () => {
    setViewing(false)
    openRef.current?.focus()
  }
  return (
    <figure className={`flex flex-col gap-1.5 ${className}`}>
      <div data-testid="web-image-frame" className="relative overflow-hidden rounded-2xl bg-line" style={{ aspectRatio: aspect }}>
        {failed ? (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
            <ImageOff aria-hidden className="size-8" />
            <span className="text-sm">Hình ảnh hiện không tải được</span>
          </div>
        ) : (
          <button
            ref={openRef}
            type="button"
            onClick={() => setViewing(true)}
            aria-label={`Xem ảnh lớn: ${image.alt}`}
            className="group block size-full cursor-zoom-in focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-primary"
          >
            {!loaded && <ImageSkeleton />}
            <img
              ref={markIfComplete(setLoaded)}
              src={image.src.url}
              srcSet={image.src.srcset.map((s) => `${s.url} ${s.width}w`).join(', ')}
              sizes={sizes}
              alt={image.alt}
              width={image.src.width}
              height={image.src.height}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={`size-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
            />
            <span
              aria-hidden
              className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-ink/60 text-surface opacity-80 transition-opacity group-hover:opacity-100"
            >
              <Maximize2 className="size-4" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex flex-col gap-0.5 leading-snug">
        {showCaption && <span className={`text-sm ${clampCaption ? 'line-clamp-2' : ''}`}>{image.caption}</span>}
        {credit === 'full' ? (
          <ImageCredit image={image} />
        ) : (
          <details className="group/credit text-xs text-muted">
            <summary className="inline-flex min-h-6 cursor-pointer list-none items-center gap-1 rounded-full hover:text-ink [&::-webkit-details-marker]:hidden">
              <Info aria-hidden className="size-3.5" />
              Nguồn ảnh
            </summary>
            <ImageCredit image={image} />
          </details>
        )}
      </figcaption>
      {viewing && <ImageViewer image={image} onClose={closeViewer} />}
    </figure>
  )
}
