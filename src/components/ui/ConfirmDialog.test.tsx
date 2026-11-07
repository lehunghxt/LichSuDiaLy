import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setViewportWidth } from '../../test/viewport'
import { ConfirmDialog } from './ConfirmDialog'

function setup() {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmDialog
      title="Xóa toàn bộ tiến độ?"
      description="Không hoàn tác được."
      confirmLabel="Xóa"
      cancelLabel="Giữ lại"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  )
  return { onConfirm, onCancel, dialog: screen.getByRole('dialog', { name: 'Xóa toàn bộ tiến độ?' }) }
}

test('desktop and tablet: a centred box; the safe choice has focus; Escape cancels', async () => {
  const { onCancel, dialog } = setup()
  expect(dialog.className).not.toContain('rounded-t-3xl')
  expect(within(dialog).getByRole('button', { name: 'Giữ lại' })).toHaveFocus()
  await userEvent.keyboard('{Escape}')
  expect(onCancel).toHaveBeenCalledTimes(1)
})

test('phones: a bottom sheet with full-width buttons; tapping the backdrop cancels; confirming calls onConfirm', async () => {
  setViewportWidth(390)
  const { onConfirm, onCancel, dialog } = setup()
  expect(dialog.className).toContain('rounded-t-3xl')
  expect(within(dialog).getByRole('button', { name: 'Giữ lại' })).toHaveFocus()
  expect(within(dialog).getByRole('button', { name: 'Xóa' }).className).toContain('w-full')
  await userEvent.click(screen.getByTestId('sheet-backdrop'))
  expect(onCancel).toHaveBeenCalledTimes(1)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Xóa' }))
  expect(onConfirm).toHaveBeenCalledTimes(1)
})
