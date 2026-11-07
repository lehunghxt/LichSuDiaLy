import { type ReactNode, type RefObject, useRef } from 'react'
import { useDialog } from '../dialog/useDialog'
import { SheetHandle } from './SheetHandle'
import { useSheetDrag } from './useSheetDrag'

// Kéo tấm xuống quá chừng này (px) rồi thả tay thì đóng
const DISMISS_DRAG = 120

interface BottomSheetProps {
  /** Tên hộp thoại (khi không có tiêu đề hiển thị để trỏ tới) */
  label?: string
  /** id của tiêu đề hiển thị trong tấm */
  labelledBy?: string
  onClose(): void
  /** Ô nhận focus khi mở; mặc định là phần tử bấm được đầu tiên */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** full: gần trọn màn hình (khung xem bài, ảnh); auto: cao vừa nội dung (hộp xác nhận, menu) */
  size?: 'auto' | 'full'
  children: ReactNode
}

/** Bottom sheet dạng hộp thoại cho điện thoại: trồi từ đáy trên nền mờ.
 *  Đóng bằng: bấm nền mờ, kéo thanh nắm xuống, Esc, hoặc nút đóng do nội dung tự đặt. */
export function BottomSheet({ label, labelledBy, onClose, initialFocusRef, size = 'auto', children }: BottomSheetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onKeyDown = useDialog(ref, onClose, initialFocusRef)
  const { down, handlers } = useSheetDrag((d) => {
    if (d > DISMISS_DRAG) onClose()
  })

  return (
    <>
      <div data-testid="sheet-backdrop" aria-hidden onClick={onClose} className="animate-fade-in fixed inset-0 z-dialog bg-ink/40" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={labelledBy}
        onKeyDown={onKeyDown}
        style={down === null ? undefined : { transform: `translateY(${Math.max(0, down)}px)` }}
        className={`animate-sheet-up fixed inset-x-0 bottom-0 z-dialog flex flex-col overflow-hidden rounded-t-3xl bg-bg pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_rgba(15,23,42,0.25)] ${
          size === 'full' ? 'top-[8dvh]' : 'max-h-[90dvh]'
        } ${down === null ? 'transition-transform duration-200 ease-out' : ''}`}
      >
        <SheetHandle handlers={handlers} />
        {children}
      </div>
    </>
  )
}
