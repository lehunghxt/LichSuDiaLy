import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from './router'
import { setViewportWidth } from '../test/viewport'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

test('renders home at /', async () => {
  renderAt('/')
  expect(await screen.findByRole('heading', { level: 1, name: /Em khám phá Lịch sử và Địa lí Việt Nam/i })).toBeInTheDocument()
})

test('header has 4 nav links', async () => {
  renderAt('/')
  const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' })
  for (const name of ['Trang chủ', 'Bản đồ khám phá', 'Trắc nghiệm', 'Tiến độ học tập']) {
    expect(within(nav).getByRole('link', { name })).toBeInTheDocument()
  }
})

test('nav link navigates to progress page', async () => {
  const router = renderAt('/')
  const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' })
  await userEvent.click(within(nav).getByRole('link', { name: 'Tiến độ học tập' }))
  expect(router.state.location.pathname).toBe('/tien-do')
})

test('unknown route shows not found', async () => {
  renderAt('/khong-co')
  expect(await screen.findByText('Không tìm thấy trang em cần')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/')
})

describe('site header per device', () => {
  test('desktop: the main menu is always shown in the header, no ☰ button', async () => {
    renderAt('/')
    expect(await screen.findByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mở menu' })).not.toBeInTheDocument()
  })

  test('tablet: ☰ opens the menu just below the header and closes it again', async () => {
    setViewportWidth(820)
    renderAt('/')
    const button = await screen.findByRole('button', { name: 'Mở menu' })
    expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(button)
    expect(screen.getByRole('button', { name: 'Đóng menu' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: 'Menu' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('phone: ☰ opens the menu as a sidebar from the right; choosing a page goes there and closes it', async () => {
    setViewportWidth(390)
    const router = renderAt('/')
    await userEvent.click(await screen.findByRole('button', { name: 'Mở menu' }))
    const sheet = screen.getByRole('dialog', { name: 'Menu' })
    expect(sheet).toHaveAttribute('data-side', 'right')
    expect(within(sheet).getByRole('button', { name: 'Đóng menu' })).toHaveFocus()
    const nav = within(sheet).getByRole('navigation', { name: 'Menu' })
    expect(within(sheet).getByRole('link', { name: 'Nguồn tham khảo' })).toBeInTheDocument()
    await userEvent.click(within(nav).getByRole('link', { name: /Trắc nghiệm/ }))
    expect(router.state.location.pathname).toBe('/on-tap')
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
  })
})
