import { X } from 'lucide-react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDialog } from '../../dialog/useDialog'
import { ImageCaption, ImageStage, type ImageViewerProps } from './parts'

/** Máy tính bảng, desktop: ảnh phủ toàn màn hình trên nền tối, chú thích ở dưới; bấm nền tối để đóng */
export function LightboxImageViewer({ image, onClose }: ImageViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onKeyDown = useDialog(rootRef, onClose, closeRef)
  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-viewer flex flex-col bg-ink/90"
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
        className="relative flex min-h-0 flex-1 items-center justify-center p-4"
      >
        <ImageStage image={image} />
      </div>
      <ImageCaption image={image} className="mx-auto mb-3 w-[min(100%-1.5rem,48rem)]" />
    </div>,
    document.body,
  )
}
