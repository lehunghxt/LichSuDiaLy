import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { nearestSnap, snapHeight, SnapSheet, type Snap } from './SnapSheet'

function Harness({ initial = 'half' as Snap }) {
  const [snap, setSnap] = useState<Snap>(initial)
  return (
    <SnapSheet label="Thông tin bản đồ" snap={snap} onSnap={setSnap}>
      <p>Nội dung</p>
    </SnapSheet>
  )
}

const sheet = () => screen.getByRole('complementary', { name: 'Thông tin bản đồ' })
const handle = () => screen.getByRole('button', { name: /Kéo hoặc bấm/ })

test('snap heights: peek shows only the top, half is about half the screen, full leaves the top strip visible', () => {
  expect(snapHeight('peek', 800)).toBe(112)
  expect(snapHeight('half', 800)).toBe(360)
  expect(snapHeight('full', 800)).toBe(688)
})

test('nearestSnap picks the closest resting height after a drag', () => {
  expect(nearestSnap(150, 800)).toBe('peek')
  expect(nearestSnap(380, 800)).toBe('half')
  expect(nearestSnap(700, 800)).toBe('full')
})

test('the sheet keeps its children, starts at its snap and tapping the handle toggles half ↔ full', async () => {
  render(<Harness />)
  expect(screen.getByText('Nội dung')).toBeInTheDocument()
  expect(sheet()).toHaveAttribute('data-snap', 'half')
  expect(handle()).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(handle())
  expect(sheet()).toHaveAttribute('data-snap', 'full')
  expect(handle()).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(handle())
  expect(sheet()).toHaveAttribute('data-snap', 'half')
})

test('from peek, a tap opens to half', async () => {
  render(<Harness initial="peek" />)
  await userEvent.click(handle())
  expect(sheet()).toHaveAttribute('data-snap', 'half')
})

test('dragging the handle down then releasing snaps to the nearest height (and is not also a tap)', () => {
  window.innerHeight = 800
  render(<Harness />)
  fireEvent.pointerDown(handle(), { clientY: 400, pointerId: 1 })
  fireEvent.pointerMove(handle(), { clientY: 600, pointerId: 1 })
  // nửa màn hình 360px, kéo xuống 200px
  expect(sheet().style.getPropertyValue('--sheet-h')).toBe('160px')
  fireEvent.pointerUp(handle(), { clientY: 600, pointerId: 1 })
  fireEvent.click(handle())
  expect(sheet()).toHaveAttribute('data-snap', 'peek')
})
