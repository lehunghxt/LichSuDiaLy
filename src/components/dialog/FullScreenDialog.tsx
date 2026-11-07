import { type ReactNode, type RefObject, useRef } from 'react'
import { useDialog } from './useDialog'

interface FullScreenDialogProps {
  /** id của tiêu đề hiển thị trong hộp thoại */
  labelledBy: string
  onClose(): void
  /** Ô nhận focus khi mở; mặc định là phần tử bấm được đầu tiên */
  initialFocusRef?: RefObject<HTMLElement | null>
  children: ReactNode
}

/** Hộp thoại phủ toàn màn hình (máy tính bảng, desktop); hành vi chung như BottomSheet (Esc, giữ Tab, khoá cuộn) */
export function FullScreenDialog({ labelledBy, onClose, initialFocusRef, children }: FullScreenDialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onKeyDown = useDialog(ref, onClose, initialFocusRef)
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-dialog flex flex-col bg-bg"
    >
      {children}
    </div>
  )
}
