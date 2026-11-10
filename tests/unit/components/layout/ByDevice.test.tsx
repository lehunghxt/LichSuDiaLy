import { act, render, screen } from '@testing-library/react'
import { setViewportWidth } from '../../../support/viewport'
import { ByDevice } from '../../../../src/components/layout/ByDevice'

const three = <ByDevice mobile={<p>điện thoại</p>} tablet={<p>máy tính bảng</p>} desktop={<p>desktop</p>} />

test('renders only the layout of the current device', () => {
  setViewportWidth(390)
  const { rerender } = render(three)
  expect(screen.getByText('điện thoại')).toBeInTheDocument()
  expect(screen.queryByText('desktop')).not.toBeInTheDocument()
  setViewportWidth(820)
  rerender(three)
  expect(screen.getByText('máy tính bảng')).toBeInTheDocument()
  setViewportWidth(1280)
  rerender(three)
  expect(screen.getByText('desktop')).toBeInTheDocument()
})

test('switches when the screen crosses a breakpoint (rotating a tablet)', () => {
  setViewportWidth(820)
  render(three)
  act(() => setViewportWidth(1100))
  expect(screen.getByText('desktop')).toBeInTheDocument()
  expect(screen.queryByText('máy tính bảng')).not.toBeInTheDocument()
})

test('without a tablet layout, tablets use the desktop one', () => {
  setViewportWidth(820)
  render(<ByDevice mobile={<p>sheet</p>} desktop={<p>hộp giữa màn hình</p>} />)
  expect(screen.getByText('hộp giữa màn hình')).toBeInTheDocument()
})
