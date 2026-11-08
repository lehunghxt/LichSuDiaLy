import { type ReactNode, type RefObject, useRef } from 'react'
import { useDialog } from '../dialog/useDialog'
import { useSheetDrag } from './useSheetDrag'

// Vuốt tấm sang phải quá chừng này (px) rồi thả tay thì đóng
const DISMISS_SWIPE = 80

interface SideDrawerProps {
  /** Tên hộp thoại */
  label: string
  onClose(): void
  /** Ô nhận focus khi mở; mặc định là phần tử bấm được đầu tiên */
  initialFocusRef?: RefObject<HTMLElement | null>
  children: ReactNode
}

/** Thanh bên dạng hộp thoại cho điện thoại: trượt ra từ mép phải (gần nút ☰), cao hết màn hình, trên nền mờ.
 *  Đóng bằng: bấm nền mờ, vuốt sang phải, Esc, hoặc nút đóng do nội dung tự đặt. */
export function SideDrawer({ label, onClose, initialFocusRef, children }: SideDrawerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onKeyDown = useDialog(ref, onClose, initialFocusRef)
  const { down, handlers, consumeClick } = useSheetDrag((d) => {
    if (d > DISMISS_SWIPE) onClose()
  }, 'x')

  return (
    <>
      <div data-testid="drawer-backdrop" aria-hidden onClick={onClose} className="animate-fade-in fixed inset-0 z-dialog bg-ink/40" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-side="right"
        onKeyDown={onKeyDown}
        {...handlers}
        onClickCapture={(e) => {
          // Vừa vuốt xong: bỏ qua click trình duyệt bắn kèm, kẻo mở nhầm link dưới ngón tay
          if (consumeClick()) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
        style={down === null ? undefined : { transform: `translateX(${Math.max(0, down)}px)` }}
        className={`animate-drawer-in fixed inset-y-0 right-0 z-dialog flex w-[min(85vw,22rem)] touch-pan-y flex-col overflow-y-auto overscroll-contain rounded-l-3xl bg-bg pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-[-12px_0_40px_rgba(15,23,42,0.25)] ${
          down === null ? 'transition-transform duration-200 ease-out' : ''
        }`}
      >
        {children}
      </div>
    </>
  )
}
