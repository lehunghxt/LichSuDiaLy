import { X } from 'lucide-react'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { BottomSheet } from '../../sheet/BottomSheet'
import { ImageCaption, ImageStage, type ImageViewerProps } from './parts'

/** Điện thoại: ảnh mở trong bottom sheet gần trọn màn hình; kéo xuống, bấm nền mờ hoặc nút ✕ để đóng.
 *  Gắn thẳng vào body: khung xem bài bên dưới có transform (hiệu ứng trượt), phần tử fixed bên trong sẽ lệch chỗ */
export function MobileImageViewer({ image, onClose }: ImageViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  return createPortal(
    <BottomSheet label={image.alt} onClose={onClose} initialFocusRef={closeRef} size="full">
      <div className="flex justify-end px-3">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Đóng ảnh"
          className="grid size-10 place-items-center rounded-full bg-surface text-muted hover:bg-line hover:text-ink"
        >
          <X aria-hidden className="size-5" strokeWidth={2.5} />
        </button>
      </div>
      <div className="relative mx-3 mt-2 flex min-h-0 flex-1 items-center justify-center rounded-2xl bg-ink/90 p-2">
        <ImageStage image={image} />
      </div>
      <ImageCaption image={image} className="m-3" />
    </BottomSheet>,
    document.body,
  )
}
