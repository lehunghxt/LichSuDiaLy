import { fireEvent, render, screen } from '@testing-library/react'
import { BottomSheet } from '../../../../src/components/sheet/BottomSheet'
import { FullScreenDialog } from '../../../../src/components/dialog/FullScreenDialog'

test('stacked dialogs: Escape closes only the top one, and does not reach listeners underneath', () => {
  const closeBottom = vi.fn()
  const closeTop = vi.fn()
  const underneath = vi.fn()
  document.addEventListener('keydown', underneath)
  const { rerender } = render(
    <FullScreenDialog labelledBy="t" onClose={closeBottom}>
      <h2 id="t">Bài học</h2>
      <BottomSheet label="Ảnh" onClose={closeTop}>
        <button type="button">Đóng ảnh</button>
      </BottomSheet>
    </FullScreenDialog>,
  )
  fireEvent.keyDown(screen.getByRole('button', { name: 'Đóng ảnh' }), { key: 'Escape' })
  expect(closeTop).toHaveBeenCalledTimes(1)
  expect(closeBottom).not.toHaveBeenCalled()
  expect(underneath).not.toHaveBeenCalled()
  // Đóng hộp trên: Esc lại thuộc về hộp bên dưới
  rerender(
    <FullScreenDialog labelledBy="t" onClose={closeBottom}>
      <h2 id="t">Bài học</h2>
    </FullScreenDialog>,
  )
  fireEvent.keyDown(document.body, { key: 'Escape' })
  expect(closeBottom).toHaveBeenCalledTimes(1)
  document.removeEventListener('keydown', underneath)
})
