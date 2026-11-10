import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ProgressProvider } from '../../../../src/features/progress/ProgressProvider'
import { PROGRESS_KEY } from '../../../../src/features/progress/progress'
import ProgressPage from '../../../../src/pages/progress/ProgressPage'

function seed() {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({
      version: 1,
      visitedRegionIds: ['trung-du-mien-nui-phia-bac'],
      viewedItemIds: ['a', 'b', 'c'],
      recentItemIds: ['c', 'b', 'a'],
      quizzes: {
        q1: { lastScore: 6, bestScore: 8, total: 10, attempts: 2, completedAt: '2026-11-01T10:00:00.000Z' },
      },
    }),
  )
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProgressProvider>
        <ProgressPage />
      </ProgressProvider>
    </MemoryRouter>,
  )
}

test('shows stats loaded from localStorage', () => {
  seed()
  renderPage()
  const stats = screen.getByRole('list', { name: 'Thống kê' })
  expect(within(stats).getByText('Địa danh đã xem').parentElement).toHaveTextContent('3')
  expect(within(stats).getByText('Vùng đã khám phá').parentElement).toHaveTextContent('1')
  expect(within(stats).getByText('Bài đã hoàn thành').parentElement).toHaveTextContent('1')
  expect(within(stats).getByText('Điểm gần nhất').parentElement).toHaveTextContent('6/10')
  expect(within(stats).getByText('Điểm cao nhất').parentElement).toHaveTextContent('8/10')
})

test('regions show how many of all regions, with a progress bar', () => {
  seed()
  renderPage()
  const stats = screen.getByRole('list', { name: 'Thống kê' })
  const regions = within(stats).getByText('Vùng đã khám phá').closest('li')!
  expect(regions).toHaveTextContent('1/4')
  expect(within(regions).getByRole('progressbar', { name: 'Vùng đã khám phá' })).toHaveAttribute('aria-valuenow', '25')
})

test('before any quiz, the score cards say "Chưa có" instead of a dash', () => {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({ version: 1, visitedRegionIds: ['nam-bo'], viewedItemIds: [], recentItemIds: [], quizzes: {} }),
  )
  renderPage()
  const stats = screen.getByRole('list', { name: 'Thống kê' })
  expect(within(stats).getByText('Điểm gần nhất').closest('li')).toHaveTextContent('Chưa có')
  expect(within(stats).getByText('Điểm cao nhất').closest('li')).toHaveTextContent('Chưa có')
  expect(stats).not.toHaveTextContent('—')
})

test('shows note that progress is stored only in this browser', () => {
  renderPage()
  expect(screen.getByText(/Tiến độ chỉ lưu trên trình duyệt này/)).toBeInTheDocument()
})

test('empty progress shows invitation to explore', () => {
  renderPage()
  expect(screen.getByText('Em chưa bắt đầu khám phá')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Khám phá bản đồ' })).toHaveAttribute('href', '/ban-do')
})

test('reset asks confirmation; cancel keeps data', async () => {
  seed()
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: 'Xóa tiến độ' }))
  const dialog = screen.getByRole('dialog', { name: 'Xóa toàn bộ tiến độ?' })
  await userEvent.click(within(dialog).getByRole('button', { name: 'Không, giữ lại' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(localStorage.getItem(PROGRESS_KEY)).toContain('"a"')
})

test('reset confirm clears data', async () => {
  seed()
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: 'Xóa tiến độ' }))
  await userEvent.click(screen.getByRole('button', { name: 'Có, xóa hết' }))
  expect(screen.getByText('Em chưa bắt đầu khám phá')).toBeInTheDocument()
  expect(localStorage.getItem(PROGRESS_KEY)).toBeNull()
})

test('dialog closes with Escape key', async () => {
  seed()
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: 'Xóa tiến độ' }))
  await userEvent.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('shows warning banner when storage is blocked; page still works', () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('SecurityError')
  })
  renderPage()
  expect(screen.getByRole('status')).toHaveTextContent('Trình duyệt đang chặn lưu tiến độ')
  spy.mockRestore()
})

test('corrupted storage recovers to empty progress', () => {
  localStorage.setItem(PROGRESS_KEY, '{oops')
  renderPage()
  expect(screen.getByText('Em chưa bắt đầu khám phá')).toBeInTheDocument()
})
