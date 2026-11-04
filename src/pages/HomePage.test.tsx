import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../app/router'
import { PROGRESS_KEY } from '../features/progress/progress'

function renderHome() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] })
  render(<RouterProvider router={router} />)
  return router
}

const TDMNPB = 'trung-du-mien-nui-phia-bac'

test('hero has title and two calls to action', async () => {
  renderHome()
  expect(await screen.findByRole('heading', { level: 1, name: /Em khám phá Lịch sử và Địa lí Việt Nam/ })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Bắt đầu khám phá/ })).toHaveAttribute('href', '/ban-do')
  expect(screen.getByRole('link', { name: /Chơi trắc nghiệm/ })).toHaveAttribute('href', '/on-tap')
})

test('journey section shows 3 steps', async () => {
  renderHome()
  const steps = await screen.findByRole('list', { name: 'Hành trình khám phá của em' })
  expect(within(steps).getAllByRole('listitem')).toHaveLength(3)
})

test('regions section: active region links to the map, others marked "Sắp ra mắt"', async () => {
  renderHome()
  const list = await screen.findByRole('list', { name: 'Bốn vùng đất của Tổ quốc' })
  const cards = within(list).getAllByRole('listitem')
  expect(cards).toHaveLength(4)
  expect(within(list).getByRole('link', { name: /Trung du và miền núi phía Bắc/ })).toHaveAttribute('href', `/ban-do/${TDMNPB}`)
  expect(within(list).getAllByText('Sắp ra mắt')).toHaveLength(3)
})

test('home page lists the sections of the region outline (no old topic names)', async () => {
  renderHome()
  const parts = await screen.findByRole('list', { name: 'Các phần khám phá' })
  const links = within(parts).getAllByRole('link')
  expect(links.map((l) => l.querySelector('[data-label]')?.textContent)).toEqual([
    'Thiên nhiên',
    'Dân cư và hoạt động sản xuất',
    'Văn hóa',
    'Lịch sử và di tích',
  ])
  expect(within(parts).getByRole('link', { name: /Văn hóa/ })).toHaveAttribute('href', `/ban-do/${TDMNPB}?phan=van-hoa`)
  expect(await within(parts).findByText('6/6 mục có nội dung')).toBeInTheDocument()
  for (const old of ['Đặc điểm tự nhiên', 'Lễ hội và văn hóa', 'Danh lam thắng cảnh', 'Di tích lịch sử', '5 chủ đề khám phá']) {
    expect(screen.queryByText(old)).toBeNull()
  }
})

test('"Em có biết?" shows a fun fact from the SGK content and cycles to another', async () => {
  renderHome()
  const box = await screen.findByRole('region', { name: 'Em có biết?' })
  const fact = await within(box).findByTestId('fun-fact')
  const first = fact.textContent
  expect(first).toBeTruthy()
  await userEvent.click(within(box).getByRole('button', { name: 'Điều thú vị khác' }))
  expect(within(box).getByTestId('fun-fact').textContent).not.toBe(first)
  expect(within(box).getByRole('link', { name: /Xem thêm/ })).toHaveAttribute('href', expect.stringContaining('/dia-danh/'))
})

test('progress card encourages a new student', async () => {
  renderHome()
  const card = await screen.findByRole('region', { name: 'Tiến độ của em' })
  expect(within(card).getByText(/Em chưa xem mục nào/)).toBeInTheDocument()
})

test('progress card offers to continue the most recent item', async () => {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({
      version: 1,
      visitedRegionIds: [TDMNPB],
      viewedItemIds: [`${TDMNPB}__den-hung`],
      recentItemIds: [`${TDMNPB}__den-hung`],
      quizzes: {},
    }),
  )
  renderHome()
  const card = await screen.findByRole('region', { name: 'Tiến độ của em' })
  expect(await within(card).findByRole('link', { name: /Khu di tích Đền Hùng/ })).toHaveAttribute('href', `/dia-danh/${TDMNPB}__den-hung`)
})
