import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from './router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

test('renders home at /', async () => {
  renderAt('/')
  expect(
    await screen.findByRole('heading', { level: 1, name: /Em khám phá Lịch sử và Địa lí Việt Nam/i }),
  ).toBeInTheDocument()
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

test('mobile menu button toggles nav list', async () => {
  renderAt('/')
  const button = await screen.findByRole('button', { name: 'Mở menu' })
  expect(button).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(button)
  expect(screen.getByRole('button', { name: 'Đóng menu' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('navigation', { name: 'Menu điện thoại' })).toBeInTheDocument()
})
