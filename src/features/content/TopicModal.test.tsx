import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { rawRegionContent } from '../../test/fixtures'
import { sgkPageUrl } from '../../lib/sources'
import { parseRegionContent } from './parse'
import { TopicModal } from './TopicModal'

function content() {
  const raw = rawRegionContent()
  raw.items[0] = {
    ...raw.items[0],
    funFacts: ['Điều thú vị 1'],
    audio: { src: '/audio/a.mp3', credit: 'Người đọc', license: 'CC BY' },
    figures: [{ lesson: 4, figure: 2, page: 19, caption: 'Lược đồ vùng A' }],
    sources: [{ title: 'SGK', url: 'https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172', page: 19, note: 'tr. 19' }],
  }
  raw.items.push({ ...raw.items[0], id: 'vung-a__dia-danh-2', title: 'Địa danh 2', relatedIds: [], location: undefined })
  return parseRegionContent(raw)
}

function setup(props: Partial<Parameters<typeof TopicModal>[0]> = {}) {
  const onSelect = vi.fn()
  const onClose = vi.fn()
  render(
    <MemoryRouter>
      <button type="button">trigger</button>
      <TopicModal content={content()} section="thien-nhien" itemSlug={null} onSelect={onSelect} onClose={onClose} {...props} />
    </MemoryRouter>,
  )
  return { onSelect, onClose }
}

test('fullscreen dialog named after the topic, with region name and topic switcher', () => {
  setup()
  const dialog = screen.getByRole('dialog', { name: 'Thiên nhiên' })
  expect(dialog).toHaveAttribute('aria-modal', 'true')
  expect(within(dialog).getByText('Vùng A')).toBeInTheDocument()
  const topics = within(dialog).getByRole('navigation', { name: 'Chủ đề' })
  expect(within(topics).getAllByRole('button')).toHaveLength(4)
  expect(within(topics).getByRole('button', { name: /Thiên nhiên/ })).toHaveAttribute('aria-pressed', 'true')
})

test('lists items of the topic and shows the first one when no item selected', () => {
  setup()
  const list = screen.getByRole('list', { name: 'Các mục trong chủ đề' })
  expect(within(list).getAllByRole('button').map((b) => b.textContent)).toEqual(['Địa danh 1', 'Địa danh 2'])
  expect(within(list).getByRole('button', { name: 'Địa danh 1' })).toHaveAttribute('aria-current', 'true')
  expect(screen.getByRole('heading', { level: 3, name: 'Địa danh 1' })).toBeInTheDocument()
})

test('itemSlug selects that item', () => {
  setup({ itemSlug: 'dia-danh-2' })
  expect(screen.getByRole('heading', { level: 3, name: 'Địa danh 2' })).toBeInTheDocument()
})

test('clicking an item or a topic calls onSelect(section, slug)', async () => {
  const { onSelect } = setup()
  await userEvent.click(screen.getByRole('button', { name: 'Địa danh 2' }))
  expect(onSelect).toHaveBeenLastCalledWith('thien-nhien', 'dia-danh-2')
  await userEvent.click(within(screen.getByRole('navigation', { name: 'Chủ đề' })).getByRole('button', { name: /Dân cư/ }))
  expect(onSelect).toHaveBeenLastCalledWith('dan-cu-san-xuat', null)
})

test('detail shows summary, highlights, fun facts, key points and location', () => {
  setup()
  expect(screen.getByText('Tóm tắt 1.')).toBeInTheDocument()
  expect(screen.getByText('Nổi bật 1')).toBeInTheDocument()
  expect(screen.getByText('Điều thú vị 1')).toBeInTheDocument()
  expect(within(screen.getByRole('region', { name: 'Ghi nhớ' })).getByText('Ghi nhớ 1')).toBeInTheDocument()
  expect(screen.getByText('Tỉnh X')).toBeInTheDocument()
})

test('SGK figures link to the exact SGK page', () => {
  setup()
  const figures = screen.getByRole('region', { name: 'Hình minh hoạ trong SGK' })
  expect(within(figures).getByText('Lược đồ vùng A')).toBeInTheDocument()
  expect(within(figures).getByRole('link', { name: 'Xem Hình 2 (Bài 4) trong SGK, trang 19' })).toHaveAttribute(
    'href',
    sgkPageUrl(19),
  )
})

test('SGK source with page links to that page', () => {
  setup()
  const sources = screen.getByRole('region', { name: 'Nguồn tham khảo' })
  expect(within(sources).getByRole('link', { name: 'SGK' })).toHaveAttribute('href', sgkPageUrl(19))
  expect(within(sources).getByText('tr. 19')).toBeInTheDocument()
})

test('related item in another topic calls onSelect with its section', async () => {
  const { onSelect } = setup()
  await userEvent.click(within(screen.getByRole('region', { name: 'Khám phá thêm' })).getByRole('button', { name: /Khoáng sản 1/ }))
  expect(onSelect).toHaveBeenLastCalledWith('dan-cu-san-xuat', 'khoang-san-1')
})

test('item without location hides the location row', () => {
  setup({ itemSlug: 'dia-danh-2' })
  expect(screen.queryByText('Vị trí')).toBeNull()
})

test('empty topic shows "Nội dung đang được cập nhật"', () => {
  setup({ section: 'lich-su' })
  expect(screen.getByText('Nội dung đang được cập nhật')).toBeInTheDocument()
})

test('Escape and the close button call onClose; close button gets focus on open', async () => {
  const { onClose } = setup()
  const close = screen.getByRole('button', { name: 'Đóng' })
  expect(close).toHaveFocus()
  await userEvent.keyboard('{Escape}')
  await userEvent.click(close)
  expect(onClose).toHaveBeenCalledTimes(2)
})

test('Tab focus stays inside the dialog', async () => {
  setup()
  const dialog = screen.getByRole('dialog')
  for (let i = 0; i < 30; i++) {
    await userEvent.tab()
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  }
})

test('audio error hides player and shows "Chưa nghe được thuyết minh"', () => {
  setup()
  const audio = document.querySelector('audio')
  expect(audio).not.toBeNull()
  if (audio) fireEvent.error(audio)
  expect(screen.getByText('Chưa nghe được thuyết minh')).toBeInTheDocument()
  expect(document.querySelector('audio')).toBeNull()
})

test('shows the province of an item (in the list and in the detail header)', () => {
  const c = content()
  c.items[0] = { ...c.items[0]!, provinceId: 'lao-cai' }
  render(
    <MemoryRouter>
      <TopicModal content={c} section="thien-nhien" itemSlug={null} onSelect={vi.fn()} onClose={vi.fn()} />
    </MemoryRouter>,
  )
  const list = screen.getByRole('list', { name: 'Các mục trong chủ đề' })
  expect(within(list).getAllByRole('button')[0]).toHaveTextContent('Lào Cai')
  const place = screen.getByTestId('item-place')
  expect(place).toHaveTextContent('Tỉnh Lào Cai')
  expect(place).toHaveTextContent('Vùng A')
})

test('item not tied to one province says it covers the whole region', () => {
  const c = content()
  c.items[0] = { ...c.items[0]!, provinceId: undefined }
  render(
    <MemoryRouter>
      <TopicModal content={c} section="thien-nhien" itemSlug={null} onSelect={vi.fn()} onClose={vi.fn()} />
    </MemoryRouter>,
  )
  expect(screen.getByTestId('item-place')).toHaveTextContent('Toàn vùng Vùng A')
})
