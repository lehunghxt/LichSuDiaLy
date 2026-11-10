import { render, screen } from '@testing-library/react'
import { SGK_URL } from '../../../../src/lib/sources'
import type { ContentItem } from '../../../../src/types/content'
import { ItemDetail } from '../../../../src/features/content/ItemDetail'

const base: ContentItem = {
  id: 'nam-bo__x',
  regionId: 'nam-bo',
  section: 'van-hoa',
  title: 'Đờn ca tài tử',
  summary: 'Tóm tắt.',
  highlights: [],
  keyPoints: [],
  images: [],
  relatedIds: [],
  sources: [],
  status: 'draft',
}

const show = (sources: ContentItem['sources']) =>
  render(<ItemDetail item={{ ...base, sources }} regionName="Nam Bộ" related={[]} onSelectRelated={() => {}} />)

test('an item with no SGK source is marked "Ngoài SGK" next to its title', () => {
  show([{ title: 'Wikipedia tiếng Việt: Đờn ca tài tử Nam Bộ', url: 'https://vi.wikipedia.org/wiki/x' }])
  expect(screen.getByText('Ngoài SGK')).toBeInTheDocument()
  expect(screen.getByText(/không có trong SGK/)).toBeInTheDocument()
})

test('an item citing the SGK has no such mark', () => {
  show([{ title: 'SGK Lịch sử và Địa lý 4', url: SGK_URL, page: 108 }])
  expect(screen.queryByText('Ngoài SGK')).not.toBeInTheDocument()
})
