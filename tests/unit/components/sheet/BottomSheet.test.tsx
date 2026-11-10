import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BottomSheet } from '../../../../src/components/sheet/BottomSheet'

function setup() {
  const onClose = vi.fn()
  render(
    <>
      <button type="button">trigger</button>
      <BottomSheet label="Xoá tiến độ?" onClose={onClose}>
        <button type="button">Huỷ</button>
        <button type="button">Xoá</button>
      </BottomSheet>
    </>,
  )
  return { onClose, dialog: screen.getByRole('dialog', { name: 'Xoá tiến độ?' }), handle: screen.getByTestId('sheet-handle') }
}

test('is a modal dialog sliding up from the bottom; focus moves into it and Tab stays inside', async () => {
  const { dialog } = setup()
  expect(dialog).toHaveAttribute('aria-modal', 'true')
  expect(dialog.className).toContain('rounded-t-3xl')
  expect(screen.getByRole('button', { name: 'Huỷ' })).toHaveFocus()
  await userEvent.tab()
  expect(screen.getByRole('button', { name: 'Xoá' })).toHaveFocus()
  await userEvent.tab()
  expect(screen.getByRole('button', { name: 'Huỷ' })).toHaveFocus()
})

test('tapping the dimmed backdrop or pressing Escape closes it', async () => {
  const { onClose } = setup()
  await userEvent.click(screen.getByTestId('sheet-backdrop'))
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalledTimes(2)
})

test('dragging the handle down far enough closes it; a short drag springs back; dragging up does not lift it', () => {
  const { onClose, dialog, handle } = setup()
  fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(handle, { clientY: 160, pointerId: 1 })
  expect(dialog.style.transform).toBe('translateY(60px)')
  fireEvent.pointerUp(handle, { clientY: 160, pointerId: 1 })
  expect(onClose).not.toHaveBeenCalled()
  expect(dialog.style.transform).toBe('')
  fireEvent.pointerDown(handle, { clientY: 300, pointerId: 1 })
  fireEvent.pointerMove(handle, { clientY: 200, pointerId: 1 })
  expect(dialog.style.transform).toBe('translateY(0px)')
  fireEvent.pointerUp(handle, { clientY: 200, pointerId: 1 })
  fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(handle, { clientY: 300, pointerId: 1 })
  fireEvent.pointerUp(handle, { clientY: 300, pointerId: 1 })
  expect(onClose).toHaveBeenCalledTimes(1)
})

test('locks page scroll while open and gives focus back when closed', () => {
  const trigger = document.createElement('button')
  document.body.appendChild(trigger)
  trigger.focus()
  const { unmount } = render(
    <BottomSheet label="Menu" onClose={() => {}}>
      <a href="/">Trang chủ</a>
    </BottomSheet>,
  )
  expect(document.body.style.overflow).toBe('hidden')
  unmount()
  expect(document.body.style.overflow).toBe('')
  expect(trigger).toHaveFocus()
  trigger.remove()
})
