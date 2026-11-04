import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../app/router'
import { SGK_URL, sgkPageUrl } from '../lib/sources'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

test('sources page lists every SGK lesson used, with page links and links to the content items', async () => {
  renderAt('/nguon-tham-khao')
  expect(await screen.findByRole('heading', { level: 1, name: 'Nguồn tham khảo' })).toBeInTheDocument()
  const table = await screen.findByRole('table', {
    name: 'Thống kê nguồn tham khảo',
  })
  const row = within(table).getByRole('row', {
    name: /Bài 13\. Văn Miếu – Quốc Tử Giám/,
  })
  const lesson = within(row).getByRole('link', {
    name: /Bài 13\. Văn Miếu – Quốc Tử Giám/,
  })
  expect(lesson.getAttribute('href')).toMatch(new RegExp(`^${SGK_URL}#page=\\d+$`))
  expect(within(row).getByRole('link', { name: 'tr. 59' })).toHaveAttribute('href', sgkPageUrl(59))
  expect(
    within(row).getByRole('link', {
      name: 'Khu di tích Văn Miếu – Quốc Tử Giám',
    }),
  ).toHaveAttribute('href', '/dia-danh/dong-bang-bac-bo__van-mieu')
  expect(row).toHaveTextContent('Đồng bằng Bắc Bộ')
  const stats = screen.getByRole('list', { name: 'Tổng quan nguồn tham khảo' })
  expect(within(stats).getByText('Bài học SGK được dẫn').closest('li')).toHaveTextContent(/\d+/)
  expect(screen.getByRole('link', { name: /Xem nguồn ảnh/ })).toHaveAttribute('href', '/nguon-anh')
})

test('footer and map panel link to the sources page', async () => {
  renderAt('/')
  const footer = await screen.findByRole('contentinfo')
  expect(within(footer).getByRole('link', { name: 'Nguồn tham khảo' })).toHaveAttribute('href', '/nguon-tham-khao')
})

test('map side panel links to the sources page', async () => {
  renderAt('/ban-do')
  const panel = await screen.findByRole('complementary', {
    name: 'Thông tin bản đồ',
  })
  expect(within(panel).getByRole('link', { name: 'Nguồn tham khảo' })).toHaveAttribute('href', '/nguon-tham-khao')
})
