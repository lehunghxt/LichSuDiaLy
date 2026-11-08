import { ByDevice } from '../layout/ByDevice'
import { CenteredConfirmDialog } from './confirm-dialog/CenteredConfirmDialog'
import { MobileConfirmDialog } from './confirm-dialog/MobileConfirmDialog'
import type { ConfirmDialogProps } from './confirm-dialog/parts'

/** Hộp xác nhận một việc khó hoàn tác. Điện thoại: bottom sheet; máy tính bảng, desktop: hộp giữa màn hình */
export function ConfirmDialog(props: ConfirmDialogProps) {
  return <ByDevice mobile={<MobileConfirmDialog {...props} />} desktop={<CenteredConfirmDialog {...props} />} />
}
