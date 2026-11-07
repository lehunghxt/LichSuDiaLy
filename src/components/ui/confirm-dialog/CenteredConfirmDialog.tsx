import { useId, useRef } from 'react'
import { useDialog } from '../../dialog/useDialog'
import { ConfirmButtons, type ConfirmDialogProps } from './parts'

/** Máy tính bảng, desktop: hộp nhỏ giữa màn hình trên nền mờ */
export function CenteredConfirmDialog(props: ConfirmDialogProps) {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const onKeyDown = useDialog(ref, props.onCancel, cancelRef)
  return (
    <div className="fixed inset-0 z-dialog flex items-center justify-center bg-ink/40 p-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="w-full max-w-md rounded-card bg-surface p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-xl font-bold">
          {props.title}
        </h2>
        <p className="mt-2 text-muted">{props.description}</p>
        <div className="mt-6">
          <ConfirmButtons props={props} cancelRef={cancelRef} stacked={false} />
        </div>
      </div>
    </div>
  )
}
