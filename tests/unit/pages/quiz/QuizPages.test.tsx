import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PROGRESS_KEY } from '../../../../src/features/progress/progress'
import { routes } from '../../../../src/app/router'

vi.mock('../../../../src/features/content/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../../src/features/content/repository')>()
  const { rawRegionContent } = await import('../../../support/fixtures')
  const raw = rawRegionContent()
  const empty = {
    ...rawRegionContent(),
    region: { ...raw.region, id: 'vung-b', name: 'Vùng B' },
    items: [],
    quizzes: [{ id: 'vung-b__on-tap-1', regionId: 'vung-b', title: 'Ôn tập rỗng', questions: [] }],
  }
  return {
    ...mod,
    repository: mod.createRepository([raw.region, empty.region], {
      'vung-a': async () => ({ default: rawRegionContent() }),
      'vung-b': async () => ({ default: empty }),
    }),
  }
})

function renderAt(path: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)
}

afterEach(() => vi.unstubAllEnvs())

test('quiz list shows quizzes with published questions and links to them', async () => {
  renderAt('/on-tap')
  const link = await screen.findByRole('link', { name: /Ôn tập 1/ })
  expect(link).toHaveAttribute('href', '/on-tap/vung-a__on-tap-1')
  expect(screen.queryByRole('link', { name: /Ôn tập rỗng/ })).toBeNull()
})

test('a quiz not done yet: card shows the question count, "Chưa làm" and a "Bắt đầu" call to action', async () => {
  renderAt('/on-tap')
  const link = await screen.findByRole('link', { name: /Ôn tập 1/ })
  const card = link.closest('li')!
  expect(card).toHaveTextContent('2 câu')
  expect(card).toHaveTextContent('Chưa làm')
  expect(link).toHaveTextContent('Bắt đầu')
  expect(within(card).queryByRole('progressbar')).toBeNull()
})

test('a quiz already done: card shows the best score with a bar and offers "Làm lại"', async () => {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({
      version: 1,
      visitedRegionIds: [],
      viewedItemIds: [],
      recentItemIds: [],
      quizzes: { 'vung-a__on-tap-1': { lastScore: 1, bestScore: 1, total: 2, attempts: 1, completedAt: '2026-11-08T10:00:00.000Z' } },
    }),
  )
  renderAt('/on-tap')
  const link = await screen.findByRole('link', { name: /Ôn tập 1/ })
  const card = link.closest('li')!
  expect(card).toHaveTextContent('Điểm cao nhất 1/2')
  expect(within(card).getByRole('progressbar', { name: 'Điểm cao nhất' })).toHaveAttribute('aria-valuenow', '50')
  expect(link).toHaveTextContent('Làm lại')
})

test('the region name is shown only when the quiz title does not already say it', async () => {
  renderAt('/on-tap')
  const card = (await screen.findByRole('link', { name: /Ôn tập 1/ })).closest('li')!
  // "Ôn tập 1" không có tên vùng → ghi tên vùng một lần
  expect(card.textContent!.match(/Vùng A/g)).toHaveLength(1)
})

test('quiz page runs quiz and records result in progress', async () => {
  renderAt('/on-tap/vung-a__on-tap-1')
  expect(await screen.findByRole('heading', { level: 1, name: 'Ôn tập 1' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'C' }))
  await userEvent.click(screen.getByRole('button', { name: 'Câu tiếp theo' }))
  await userEvent.click(screen.getByRole('button', { name: 'Sai' }))
  await userEvent.click(screen.getByRole('button', { name: 'Xem kết quả' }))
  expect(screen.getByRole('heading', { name: 'Em đúng 2/2 câu' })).toBeInTheDocument()
  expect(localStorage.getItem(PROGRESS_KEY)).toContain('"vung-a__on-tap-1"')
})

test('draft questions excluded in PROD', async () => {
  vi.stubEnv('PROD', true)
  renderAt('/on-tap/vung-a__on-tap-1')
  expect(await screen.findByText('Câu 1/1')).toBeInTheDocument()
})

test('quiz with 0 published questions shows EmptyState', async () => {
  renderAt('/on-tap/vung-b__on-tap-1')
  expect(await screen.findByText('Bài trắc nghiệm đang được chuẩn bị')).toBeInTheDocument()
})

test('unknown quizId shows NotFound', async () => {
  renderAt('/on-tap/zzz')
  expect(await screen.findByText('Không tìm thấy bài trắc nghiệm')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về danh sách bài' })).toHaveAttribute('href', '/on-tap')
})
