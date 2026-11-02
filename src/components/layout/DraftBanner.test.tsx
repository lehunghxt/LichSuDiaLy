import { render, screen } from '@testing-library/react'
import { DraftBanner } from './DraftBanner'

test('shows notice when drafts are shown in a production build', () => {
  vi.stubEnv('PROD', true)
  vi.stubEnv('VITE_SHOW_DRAFTS', 'true')
  render(<DraftBanner />)
  expect(screen.getByRole('status')).toHaveTextContent('Bản xem thử: nội dung đang chờ giáo viên duyệt')
})

test('hidden otherwise', () => {
  vi.stubEnv('PROD', true)
  vi.stubEnv('VITE_SHOW_DRAFTS', '')
  const { container } = render(<DraftBanner />)
  expect(container).toBeEmptyDOMElement()
})
