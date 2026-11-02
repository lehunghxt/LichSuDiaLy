import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../app/router'
import { PROGRESS_KEY } from '../features/progress/progress'

vi.mock('../features/content/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../features/content/repository')>()
  const { rawRegionContent } = await import('../test/fixtures')
  const raw = rawRegionContent()
  raw.items[0] = {
    ...raw.items[0],
    funFacts: ['Điều thú vị 1'],
    audio: { src: '/audio/a.mp3', credit: 'Người đọc', license: 'CC BY' },
  }
  return {
    ...mod,
    repository: mod.createRepository([raw.region], { 'vung-a': async () => ({ default: raw }) }),
  }
})

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

test('RegionPage shows intro and 5 tabs; arrow keys move between tabs', async () => {
  renderAt('/vung/vung-a')
  expect(await screen.findByRole('heading', { level: 1, name: 'Vùng A' })).toBeInTheDocument()
  expect(await screen.findByText('Giới thiệu vùng A.')).toBeInTheDocument()
  const tabs = within(screen.getByRole('tablist', { name: 'Chủ đề khám phá' })).getAllByRole('tab')
  expect(tabs.map((t) => t.textContent)).toEqual([
    expect.stringContaining('Đặc điểm tự nhiên'),
    expect.stringContaining('Lễ hội và văn hóa'),
    expect.stringContaining('Khoáng sản'),
    expect.stringContaining('Danh lam thắng cảnh'),
    expect.stringContaining('Di tích lịch sử'),
  ])
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
  tabs[0]?.focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(tabs[1]).toHaveFocus()
  expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
  expect(tabs[4]).toHaveAttribute('aria-selected', 'true')
})

test('tab ?chu-de=landmark is selected from URL query and lists its items', async () => {
  renderAt('/vung/vung-a?chu-de=landmark')
  const tab = await screen.findByRole('tab', { name: /Danh lam thắng cảnh/ })
  expect(tab).toHaveAttribute('aria-selected', 'true')
  const panel = screen.getByRole('tabpanel')
  expect(within(panel).getByRole('link', { name: /Địa danh 1/ })).toHaveAttribute('href', '/dia-danh/vung-a__dia-danh-1')
  expect(within(panel).getByText('Tóm tắt 1.')).toBeInTheDocument()
})

test('clicking a tab updates the URL query', async () => {
  const router = renderAt('/vung/vung-a')
  await userEvent.click(await screen.findByRole('tab', { name: /Khoáng sản/ }))
  expect(router.state.location.search).toBe('?chu-de=mineral')
})

test('empty category shows EmptyState "Nội dung đang được cập nhật"', async () => {
  renderAt('/vung/vung-a?chu-de=historical_site')
  expect(await screen.findByText('Nội dung đang được cập nhật')).toBeInTheDocument()
})

test('unknown region shows not found', async () => {
  renderAt('/vung/khong-co')
  expect(await screen.findByText('Không tìm thấy vùng này')).toBeInTheDocument()
})

test('ItemPage shows title, category, highlights, keyPoints under "Ghi nhớ", fun facts, sources, related, back link', async () => {
  renderAt('/dia-danh/vung-a__dia-danh-1')
  expect(await screen.findByRole('heading', { level: 1, name: 'Địa danh 1' })).toBeInTheDocument()
  expect(screen.getByText('Danh lam thắng cảnh')).toBeInTheDocument()
  expect(screen.getByText('Tỉnh X')).toBeInTheDocument()
  expect(screen.getByText('Nổi bật 1')).toBeInTheDocument()
  const remember = screen.getByRole('region', { name: 'Ghi nhớ' })
  expect(within(remember).getByText('Ghi nhớ 1')).toBeInTheDocument()
  expect(screen.getByText('Điều thú vị 1')).toBeInTheDocument()
  const sources = screen.getByRole('region', { name: 'Nguồn tham khảo' })
  expect(within(sources).getByRole('link', { name: 'SGK' })).toHaveAttribute('href', expect.stringContaining('taphuan.nxbgd.vn'))
  expect(within(sources).getByText('tr. 1')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Khoáng sản 1/ })).toHaveAttribute('href', '/dia-danh/vung-a__khoang-san-1')
  expect(screen.getByRole('link', { name: 'Về bản đồ' })).toHaveAttribute('href', '/ban-do/vung-a')
})

test('ItemPage without location hides the location row', async () => {
  renderAt('/dia-danh/vung-a__khoang-san-1')
  await screen.findByRole('heading', { level: 1, name: 'Khoáng sản 1' })
  expect(screen.queryByText('Vị trí')).toBeNull()
})

test('audio error hides player and shows "Chưa nghe được thuyết minh"', async () => {
  renderAt('/dia-danh/vung-a__dia-danh-1')
  await screen.findByRole('heading', { level: 1, name: 'Địa danh 1' })
  const audio = document.querySelector('audio')
  expect(audio).not.toBeNull()
  if (audio) fireEvent.error(audio)
  expect(screen.getByText('Chưa nghe được thuyết minh')).toBeInTheDocument()
  expect(document.querySelector('audio')).toBeNull()
})

test('unknown itemId shows NotFound with link to /ban-do', async () => {
  renderAt('/dia-danh/vung-a__xyz')
  expect(await screen.findByText('Không tìm thấy địa danh này')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về bản đồ' })).toHaveAttribute('href', '/ban-do')
})

test('visiting ItemPage records item as viewed', async () => {
  renderAt('/dia-danh/vung-a__dia-danh-1')
  await screen.findByRole('heading', { level: 1, name: 'Địa danh 1' })
  await waitFor(() => expect(localStorage.getItem(PROGRESS_KEY)).toContain('vung-a__dia-danh-1'))
})
