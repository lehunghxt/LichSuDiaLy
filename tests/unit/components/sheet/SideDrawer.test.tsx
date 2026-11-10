import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SideDrawer } from '../../../../src/components/sheet/SideDrawer'

function setup() {
  const onClose = vi.fn()
  const onLink = vi.fn()
  render(
    <SideDrawer label="Menu" onClose={onClose}>
      <a href="#trang" onClick={onLink}>
        Trang chủ
      </a>
    </SideDrawer>,
  )
  return { onClose, onLink, drawer: screen.getByRole('dialog', { name: 'Menu' }) }
}

test('slides in from the right edge, full height, and takes focus', () => {
  const { drawer } = setup()
  expect(drawer).toHaveAttribute('data-side', 'right')
  expect(drawer.className).toContain('inset-y-0')
  expect(drawer.contains(document.activeElement)).toBe(true)
})

test('tapping the dimmed backdrop or pressing Escape closes it', async () => {
  const { onClose } = setup()
  await userEvent.click(screen.getByTestId('drawer-backdrop'))
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalledTimes(2)
})

test('swiping it to the right closes it; a short swipe springs back; tapping a link still works', async () => {
  const { onClose, onLink, drawer } = setup()
  fireEvent.pointerDown(drawer, { clientX: 100, clientY: 300, pointerId: 1 })
  fireEvent.pointerMove(drawer, { clientX: 130, clientY: 300, pointerId: 1 })
  expect(drawer.style.transform).toBe('translateX(30px)')
  fireEvent.pointerUp(drawer, { clientX: 130, clientY: 300, pointerId: 1 })
  expect(onClose).not.toHaveBeenCalled()
  expect(drawer.style.transform).toBe('')

  fireEvent.pointerDown(drawer, { clientX: 100, clientY: 300, pointerId: 1 })
  fireEvent.pointerMove(drawer, { clientX: 220, clientY: 300, pointerId: 1 })
  fireEvent.pointerUp(drawer, { clientX: 220, clientY: 300, pointerId: 1 })
  expect(onClose).toHaveBeenCalledTimes(1)

  await userEvent.click(screen.getByRole('link', { name: 'Trang chủ' }))
  expect(onLink).toHaveBeenCalledTimes(1)
})

test('dragging to the left does not pull it off the right edge', () => {
  const { drawer } = setup()
  fireEvent.pointerDown(drawer, { clientX: 200, clientY: 300, pointerId: 1 })
  fireEvent.pointerMove(drawer, { clientX: 120, clientY: 300, pointerId: 1 })
  expect(drawer.style.transform).toBe('translateX(0px)')
})

test('a mostly vertical gesture scrolls the menu instead of dragging it', () => {
  const { onClose, drawer } = setup()
  fireEvent.pointerDown(drawer, { clientX: 100, clientY: 300, pointerId: 1 })
  fireEvent.pointerMove(drawer, { clientX: 110, clientY: 200, pointerId: 1 })
  fireEvent.pointerMove(drawer, { clientX: 220, clientY: 150, pointerId: 1 })
  fireEvent.pointerUp(drawer, { clientX: 220, clientY: 150, pointerId: 1 })
  expect(drawer.style.transform).toBe('')
  expect(onClose).not.toHaveBeenCalled()
})
