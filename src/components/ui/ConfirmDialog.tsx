import { useDevice } from '../../lib/device'
import { CenteredConfirmDialog } from './confirm-dialog/CenteredConfirmDialog'
import { MobileConfirmDialog } from './confirm-dialog/MobileConfirmDialog'
import type { ConfirmDialogProps } from './confirm-dialog/parts'

/** Hộp xác nhận một việc khó hoàn tác. Điện thoại: bottom sheet; máy tính bảng, desktop: hộp giữa màn hình */
export function ConfirmDialog(props: ConfirmDialogProps) {
  return useDevice() === 'mobile' ? <MobileConfirmDialog {...props} /> : <CenteredConfirmDialog {...props} />
}
