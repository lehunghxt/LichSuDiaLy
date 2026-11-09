import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../../app/router'
import { PROGRESS_KEY } from '../../features/progress/progress'

function renderHome() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] })
  render(<RouterProvider router={router} />)
  return router
}

const TDMNPB = 'trung-du-mien-nui-phia-bac'

test('hero has title and two calls to action', async () => {
  renderHome()
  expect(await screen.findByRole('heading', { level: 1, name: /Em khám phá Lịch sử và Địa lý Việt Nam/ })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Bắt đầu khám phá/ })).toHaveAttribute('href', '/ban-do')
  expect(screen.getByRole('link', { name: /Chơi trắc nghiệm/ })).toHaveAttribute('href', '/on-tap')
})

test('journey section shows 3 steps', async () => {
  renderHome()
  const steps = await screen.findByRole('list', { name: 'Hành trình khám phá của em' })
  expect(within(steps).getAllByRole('listitem')).toHaveLength(3)
})

test('regions section: every region has content and links to the map', async () => {
  renderHome()
  const list = await screen.findByRole('list', { name: 'Bốn vùng đất của Tổ quốc' })
  const cards = within(list).getAllByRole('listitem')
  expect(cards).toHaveLength(4)
  expect(within(list).getByRole('link', { name: /Trung du và miền núi phía Bắc/ })).toHaveAttribute('href', `/ban-do/${TDMNPB}`)
  expect(within(list).getByRole('link', { name: /Nam Bộ/ })).toHaveAttribute('href', '/ban-do/nam-bo')
  expect(within(list).queryByText('Sắp ra mắt')).not.toBeInTheDocument()
})

test('every region card shows a cover photo of that region, credited, outside the card link', async () => {
  renderHome()
  const list = await screen.findByRole('list', { name: 'Bốn vùng đất của Tổ quốc' })
  await waitFor(() => expect(list.querySelectorAll('img')).toHaveLength(4))
  for (const card of within(list).getAllByRole('listitem')) {
    const photo = card.querySelector('img')!
    expect(photo.getAttribute('src')).toMatch(/^https:\/\/upload\.wikimedia\.org\//)
    expect(photo).toHaveAttribute('referrerpolicy', 'no-referrer')
    const commons = within(card).getByRole('link', { name: 'Wikimedia Commons' })
    // Link ghi nguồn không được lồng trong link của thẻ
    expect(commons.closest('a[href^="/ban-do/"]')).toBeNull()
  }
  // Tên link của thẻ vẫn là tên vùng (ảnh chỉ minh hoạ)
  expect(within(list).getByRole('link', { name: /^Đồng bằng Bắc Bộ/ })).toHaveAttribute('href', '/ban-do/dong-bang-bac-bo')
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
  expect(await within(parts).findByText('8/8 mục có nội dung')).toBeInTheDocument()
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

test('hero numbers count all four regions, the same scope as "4 vùng đất"', async () => {
  renderHome()
  const hero = (await screen.findByRole('heading', { level: 1 })).closest('section')!
  // 14 + 12 + 14 + 14 câu của bốn bài
  expect(await within(hero).findByText('54')).toBeInTheDocument()
  expect(within(hero).getByText('câu hỏi trắc nghiệm')).toBeInTheDocument()
})

test('"Em có biết?" names the region of each fact and moves on to another region', async () => {
  renderHome()
  const box = await screen.findByRole('region', { name: 'Em có biết?' })
  expect(await within(box).findByText('Trung du và miền núi phía Bắc')).toBeInTheDocument()
  await userEvent.click(within(box).getByRole('button', { name: 'Điều thú vị khác' }))
  expect(within(box).queryByText('Trung du và miền núi phía Bắc')).toBeNull()
})

test('"Các phần khám phá" can switch to another region', async () => {
  renderHome()
  const group = await screen.findByRole('group', { name: 'Chọn vùng' })
  expect(within(group).getAllByRole('button')).toHaveLength(4)
  await userEvent.click(within(group).getByRole('button', { name: /Nam Bộ/ }))
  const parts = await screen.findByRole('list', { name: 'Các phần khám phá' })
  await waitFor(() => expect(within(parts).getByRole('link', { name: /Văn hóa/ })).toHaveAttribute('href', '/ban-do/nam-bo?phan=van-hoa'))
})
