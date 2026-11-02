import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { PROGRESS_KEY } from '../features/progress/progress'
import { routes } from '../app/router'

vi.mock('../features/content/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../features/content/repository')>()
  const { rawRegionContent } = await import('../test/fixtures')
  const raw = rawRegionContent()
  const empty = { ...rawRegionContent(), region: { ...raw.region, id: 'vung-b', name: 'Vùng B' }, items: [], quizzes: [
    { id: 'vung-b__on-tap-1', regionId: 'vung-b', title: 'Ôn tập rỗng', questions: [] },
  ] }
  return {
    ...mod,
    repository: mod.createRepository(
      [raw.region, empty.region],
      { 'vung-a': async () => ({ default: rawRegionContent() }), 'vung-b': async () => ({ default: empty }) },
    ),
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
  expect(await screen.findByText('Bài ôn tập đang được chuẩn bị')).toBeInTheDocument()
})

test('unknown quizId shows NotFound', async () => {
  renderAt('/on-tap/zzz')
  expect(await screen.findByText('Không tìm thấy bài ôn tập')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về danh sách bài' })).toHaveAttribute('href', '/on-tap')
})
