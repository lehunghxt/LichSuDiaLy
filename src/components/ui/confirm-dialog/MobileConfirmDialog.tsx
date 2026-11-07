import { useId, useRef } from 'react'
import { BottomSheet } from '../../sheet/BottomSheet'
import { ConfirmButtons, type ConfirmDialogProps } from './parts'

/** Điện thoại: bottom sheet, hai nút to rộng hết bề ngang (dễ bấm bằng ngón cái); bấm nền mờ = Huỷ */
export function MobileConfirmDialog(props: ConfirmDialogProps) {
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  return (
    <BottomSheet labelledBy={titleId} onClose={props.onCancel} initialFocusRef={cancelRef}>
      <div className="flex flex-col gap-2 px-5 pb-5">
        <h2 id={titleId} className="text-xl font-bold">
          {props.title}
        </h2>
        <p className="text-muted">{props.description}</p>
        <div className="mt-4">
          <ConfirmButtons props={props} cancelRef={cancelRef} stacked />
        </div>
      </div>
    </BottomSheet>
  )
}
