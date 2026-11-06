import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { rawRegionContent } from '../../test/fixtures'
import { sgkPageUrl } from '../../lib/sources'
import { parseRegionContent } from './parse'
import type { RegionOutline } from '../../types/content'
import { SectionModal } from './SectionModal'

function content() {
  const raw = rawRegionContent()
  raw.items[0] = {
    ...raw.items[0],
    funFacts: ['Điều thú vị 1'],
    audio: { src: '/audio/a.mp3', credit: 'Người đọc', license: 'CC BY' },
    figures: [{ lesson: 4, figure: 2, page: 19, caption: 'Lược đồ vùng A' }],
    sources: [
      { title: 'SGK', url: 'https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172', page: 19, note: 'tr. 19' },
    ],
  }
  raw.items.push({
    ...raw.items[0],
    id: 'vung-a__dia-danh-2',
    title: 'Địa danh 2',
    summary: 'Tóm tắt 2.',
    highlights: [],
    keyPoints: [],
    funFacts: undefined,
    audio: undefined,
    figures: undefined,
    sources: [],
    relatedIds: [],
    location: undefined,
  })
  return parseRegionContent(raw)
}

const outline = (): RegionOutline => ({
  regionId: 'vung-a',
  sections: [
    {
      id: 'thien-nhien',
      topics: [
        { id: 'dia-hinh', title: 'Địa hình', hint: '(núi cao)', itemIds: ['vung-a__dia-danh-1', 'vung-a__dia-danh-2'] },
        { id: 'khi-hau', title: 'Khí hậu', itemIds: [] },
      ],
    },
    { id: 'dan-cu-san-xuat', topics: [{ id: 'khai-thac', title: 'Khai thác khoáng sản', itemIds: ['vung-a__khoang-san-1'] }] },
    { id: 'van-hoa', topics: [{ id: 'le-hoi', title: 'Lễ hội', itemIds: [] }] },
    { id: 'lich-su', topics: [] },
  ],
})

function setup(props: Partial<Parameters<typeof SectionModal>[0]> = {}) {
  const onSelect = vi.fn()
  const onSelectItem = vi.fn()
  const onClose = vi.fn()
  const c = content()
  render(
    <MemoryRouter>
      <button type="button">trigger</button>
      <SectionModal
        region={c.region}
        outline={outline()}
        items={c.items}
        section="thien-nhien"
        topicId={null}
        itemSlug={null}
        onSelect={onSelect}
        onSelectItem={onSelectItem}
        onClose={onClose}
        {...props}
      />
    </MemoryRouter>,
  )
  return { onSelect, onSelectItem, onClose }
}

test('fullscreen dialog named after the section, with the region name', () => {
  setup()
  const dialog = screen.getByRole('dialog', { name: 'Thiên nhiên' })
  expect(dialog).toHaveAttribute('aria-modal', 'true')
  expect(within(dialog).getByText('Vùng A')).toBeInTheDocument()
})

test('section tabs follow the outline; current section pressed', () => {
  setup()
  const tabs = within(screen.getByRole('navigation', { name: 'Các phần' })).getAllByRole('button')
  expect(tabs.map((t) => t.textContent)).toEqual(['Thiên nhiên', 'Dân cư và hoạt động sản xuất', 'Văn hóa', 'Lịch sử và di tích'])
  expect(tabs[0]).toHaveAttribute('aria-pressed', 'true')
  expect(tabs[1]).toHaveAttribute('aria-pressed', 'false')
})

test('topic list shows titles and hints in outline order', () => {
  setup()
  const topics = within(screen.getByRole('list', { name: 'Các mục trong phần' })).getAllByRole('button')
  expect(topics).toHaveLength(2)
  expect(topics[0]).toHaveTextContent('Địa hình')
  expect(topics[0]).toHaveTextContent('(núi cao)')
  expect(topics[0]).toHaveAttribute('aria-current', 'true')
  expect(topics[1]).toHaveTextContent('Khí hậu')
  expect(topics[1]).toHaveTextContent('đang cập nhật')
})

test('topic with two items shows both, in outline order', () => {
  setup()
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Địa danh 1', 'Địa danh 2'])
})

test('empty topic shows "Nội dung đang được cập nhật"', () => {
  setup({ topicId: 'khi-hau' })
  expect(screen.getByText('Nội dung đang được cập nhật')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
})

test('section without topics shows "Nội dung đang được cập nhật"', () => {
  setup({ section: 'lich-su' })
  expect(screen.getByText('Nội dung đang được cập nhật')).toBeInTheDocument()
})

test('region without content: modal opens and every topic is "đang cập nhật"', () => {
  setup({ items: [] })
  for (const t of within(screen.getByRole('list', { name: 'Các mục trong phần' })).getAllByRole('button')) {
    expect(t).toHaveTextContent('đang cập nhật')
  }
  expect(screen.getByText('Nội dung đang được cập nhật')).toBeInTheDocument()
})

test('clicking a topic or a section calls onSelect(section, topicId)', async () => {
  const { onSelect } = setup()
  await userEvent.click(within(screen.getByRole('list', { name: 'Các mục trong phần' })).getByRole('button', { name: /Khí hậu/ }))
  expect(onSelect).toHaveBeenLastCalledWith('thien-nhien', 'khi-hau')
  await userEvent.click(within(screen.getByRole('navigation', { name: 'Các phần' })).getByRole('button', { name: /Dân cư/ }))
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
  expect(within(figures).getByRole('link', { name: 'Xem Hình 2 (Bài 4) trong SGK, trang 19' })).toHaveAttribute('href', sgkPageUrl(19))
})

test('SGK source with page links to that page', () => {
  setup()
  const sources = screen.getByRole('region', { name: 'Nguồn tham khảo' })
  expect(within(sources).getByRole('link', { name: 'SGK' })).toHaveAttribute('href', sgkPageUrl(19))
  expect(within(sources).getByText('tr. 19')).toBeInTheDocument()
})

test('related item calls onSelectItem with that item', async () => {
  const { onSelectItem } = setup()
  await userEvent.click(within(screen.getAllByRole('region', { name: 'Khám phá thêm' })[0]!).getByRole('button', { name: /Khoáng sản 1/ }))
  expect(onSelectItem).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'vung-a__khoang-san-1' }))
})

test('item without location hides the location row', () => {
  setup()
  // Địa danh 1 có vị trí, Địa danh 2 thì không
  expect(screen.getAllByText('Vị trí')).toHaveLength(1)
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

test('shows the province of an item in its detail header', () => {
  const c = content()
  c.items[0] = { ...c.items[0]!, provinceId: 'lao-cai' }
  setup({ items: c.items })
  const place = screen.getAllByTestId('item-place')[0]!
  expect(place).toHaveTextContent('Tỉnh Lào Cai')
  expect(place).toHaveTextContent('Vùng A')
})

test('item not tied to one province says it covers the whole region', () => {
  const c = content()
  c.items[0] = { ...c.items[0]!, provinceId: undefined }
  setup({ items: c.items })
  expect(screen.getAllByTestId('item-place')[0]).toHaveTextContent('Toàn vùng Vùng A')
})

test('the current topic and section are scrolled into view sideways (phones show them as a scrolling row)', () => {
  const calls: { el: Element; arg: unknown }[] = []
  // jsdom không có scrollIntoView
  Element.prototype.scrollIntoView = function (this: Element, arg?: boolean | ScrollIntoViewOptions) {
    calls.push({ el: this, arg })
  }
  try {
    setup({ topicId: 'khi-hau' })
    const current = screen.getByRole('button', { name: /Khí hậu/ })
    const section = screen.getByRole('button', { name: 'Thiên nhiên' })
    expect(calls).toContainEqual({ el: current, arg: { block: 'nearest', inline: 'nearest' } })
    expect(calls).toContainEqual({ el: section, arg: { block: 'nearest', inline: 'nearest' } })
  } finally {
    delete (Element.prototype as Partial<Element>).scrollIntoView
  }
})

test('item photos tell the browser they fill the width on phones (one column below sm), so a sharp size is downloaded', () => {
  const U = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg'
  setup({
    images: [
      {
        id: 'p__f',
        provider: 'wikimedia-commons',
        regionId: 'vung-a',
        provinceId: 'p',
        section: 'thien-nhien',
        itemIds: ['vung-a__dia-danh-1'],
        alt: 'Ảnh địa danh',
        caption: 'Địa danh 1.',
        src: { url: `${U}/960px-F.jpg`, width: 960, height: 720, srcset: [{ url: `${U}/500px-F.jpg`, width: 500 }] },
        attribution: { title: 'File:F.jpg', author: 'A', license: 'CC BY 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:F.jpg' },
        status: 'draft',
      },
    ],
  })
  const sizes = screen.getByRole('img', { name: 'Ảnh địa danh' }).getAttribute('sizes') ?? ''
  expect(sizes.split(',').at(-1)?.trim()).toBe('100vw')
  expect(sizes).toContain('(min-width: 640px) 50vw')
})

const handle = () => screen.getByTestId('sheet-handle')

test('small screens: the modal is a bottom sheet over a dimmed backdrop; tapping the backdrop closes it', async () => {
  const { onClose } = setup()
  const dialog = screen.getByRole('dialog')
  expect(dialog.className).toContain('rounded-t-3xl')
  expect(dialog.className).toContain('lg:rounded-none')
  expect(handle()).toBeInTheDocument()
  await userEvent.click(screen.getByTestId('sheet-backdrop'))
  expect(onClose).toHaveBeenCalledTimes(1)
})

test('dragging the handle down far enough closes the sheet; a short drag springs back', () => {
  const { onClose } = setup()
  const dialog = screen.getByRole('dialog')
  fireEvent.pointerDown(handle(), { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(handle(), { clientY: 160, pointerId: 1 })
  expect(dialog.style.transform).toBe('translateY(60px)')
  fireEvent.pointerUp(handle(), { clientY: 160, pointerId: 1 })
  expect(onClose).not.toHaveBeenCalled()
  expect(dialog.style.transform).toBe('')
  fireEvent.pointerDown(handle(), { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(handle(), { clientY: 300, pointerId: 1 })
  fireEvent.pointerUp(handle(), { clientY: 300, pointerId: 1 })
  expect(onClose).toHaveBeenCalledTimes(1)
})

test('dragging up does not move the sheet above its resting place', () => {
  setup()
  fireEvent.pointerDown(handle(), { clientY: 300, pointerId: 1 })
  fireEvent.pointerMove(handle(), { clientY: 200, pointerId: 1 })
  expect(screen.getByRole('dialog').style.transform).toBe('translateY(0px)')
})
