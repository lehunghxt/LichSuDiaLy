// Mảnh dùng chung của hộp xác nhận (mọi thiết bị). Không chứa lớp responsive.
import type { RefObject } from 'react'

export interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm(): void
  onCancel(): void
}

/** Hai nút: Huỷ (an toàn, nhận focus) và Xác nhận. stacked: hai nút rộng hết bề ngang, xếp dọc */
export function ConfirmButtons({
  props,
  cancelRef,
  stacked,
}: {
  props: ConfirmDialogProps
  cancelRef: RefObject<HTMLButtonElement | null>
  stacked: boolean
}) {
  const size = stacked ? 'w-full' : ''
  return (
    <div className={stacked ? 'flex flex-col-reverse gap-3' : 'flex flex-wrap justify-end gap-3'}>
      <button
        ref={cancelRef}
        type="button"
        onClick={props.onCancel}
        className={`min-h-12 rounded-full border border-line px-5 font-semibold hover:bg-bg ${size}`}
      >
        {props.cancelLabel}
      </button>
      <button
        type="button"
        onClick={props.onConfirm}
        className={`min-h-12 rounded-full bg-accent px-5 font-semibold text-ink hover:brightness-95 ${size}`}
      >
        {props.confirmLabel}
      </button>
    </div>
  )
}
