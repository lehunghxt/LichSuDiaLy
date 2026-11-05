import { ImageOff, X } from 'lucide-react'
import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { WebImage } from '../../types/content'
import { ImageCredit } from './ImageCredit'
import { ImageSkeleton } from './ImageSkeleton'
import { markIfComplete } from './imageLoad'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface ImageViewerProps {
  image: WebImage
  onClose(): void
}

/** Xem ảnh toàn màn hình: nền tối, ảnh vừa khít màn hình, kèm chú thích và ghi nguồn */
export function ImageViewer({ image, onClose }: ImageViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const closeCb = useRef(onClose)
  closeCb.current = onClose

  useEffect(() => {
    closeRef.current?.focus()
    // Bắt Esc ở pha capture để chỉ đóng ảnh, không đóng luôn modal đang mở bên dưới
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      closeCb.current()
    }
    window.addEventListener('keydown', onKey, true)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = overflow
    }
  }, [])

  // Giữ Tab trong khung xem ảnh: phía sau là lớp nền tối, focus ra ngoài thì em không thấy đang ở đâu
  const trapTab = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || !rootRef.current) return
    const nodes = [...rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
    // Không để SectionModal bên dưới xử lý tiếp phím Tab này
    e.stopPropagation()
  }

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onKeyDown={trapTab}
      className="fixed inset-0 z-[1400] flex flex-col bg-ink/90"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Đóng ảnh"
        className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-surface text-ink shadow-lg hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
      >
        <X aria-hidden className="size-6" />
      </button>
      <div
        data-testid="image-viewer-backdrop"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-6"
      >
        {failed ? (
          <div className="flex flex-col items-center gap-2 text-surface">
            <ImageOff aria-hidden className="size-10" />
            <span>Hình ảnh hiện không tải được</span>
          </div>
        ) : (
          !loaded && (
            <span className="absolute inset-3 m-auto aspect-[4/3] max-h-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] sm:inset-6">
              <ImageSkeleton className="rounded-lg bg-surface/15" />
            </span>
          )
        )}
        {!failed && (
          <img
            ref={markIfComplete(setLoaded)}
            src={image.src.url}
            srcSet={image.src.srcset.map((s) => `${s.url} ${s.width}w`).join(', ')}
            sizes="100vw"
            alt={image.alt}
            width={image.src.width}
            height={image.src.height}
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`max-h-full max-w-full rounded-lg object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </div>
      <div className="mx-auto mb-3 flex w-[min(100%-1.5rem,48rem)] flex-col gap-0.5 rounded-xl bg-surface px-4 py-2.5 leading-snug">
        <span className="text-sm">{image.caption}</span>
        <ImageCredit image={image} />
      </div>
    </div>,
    document.body,
  )
}
