import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../app/router'
import { PROGRESS_KEY } from '../features/progress/progress'

// Leaflet cần trình duyệt thật; trong test thay bằng bản giả giữ nguyên các callback
vi.mock('../features/map/VietnamMap', () => ({
  default: (props: {
    selectedRegionId: string | null
    onSelectRegion(id: string): void
    onSelectProvince(id: string | null): void
  }) => (
    <div data-testid="map" data-selected={props.selectedRegionId ?? ''}>
      <button type="button" onClick={() => props.onSelectRegion('trung-du-mien-nui-phia-bac')}>
        polygon-tdmnpb
      </button>
      <button type="button" onClick={() => props.onSelectProvince('phu-tho')}>
        polygon-phu-tho
      </button>
      <button type="button" onClick={() => props.onSelectProvince('lai-chau')}>
        polygon-lai-chau
      </button>
      <button type="button" onClick={() => props.onSelectProvince('can-tho')}>
        polygon-can-tho
      </button>
    </div>
  ),
}))

// Thư viện ảnh giả: 1 ảnh bìa (Lào Cai), 1 ảnh Đền Hùng (Phú Thọ), 1 ảnh Cần Thơ (vùng sắp ra mắt)
vi.mock('../features/images/library', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../features/images/library')>()
  const img = (id: string, provinceId: string, section: string, alt: string, itemIds: string[] = []) => ({
    id,
    provider: 'wikimedia-commons',
    provinceId,
    section,
    itemIds,
    alt,
    caption: `Chú thích ${alt}`,
    src: { url: `https://upload.wikimedia.org/wikipedia/commons/${id}.jpg`, width: 4, height: 3, srcset: [] },
    attribution: { title: `File:${id}.jpg`, author: 'Tác giả', license: 'Public domain', sourceUrl: `https://commons.wikimedia.org/wiki/File:${id}.jpg` },
    status: 'verified',
  })
  const mod = (v: unknown) => () => Promise.resolve({ default: v })
  return {
    ...orig,
    imageLibrary: orig.createImageLibrary({
      '../../data/images/trung-du-mien-nui-phia-bac/lao-cai.json': mod([img('lao-cai__nui', 'lao-cai', 'thien-nhien', 'Ảnh núi Lào Cai')]),
      '../../data/images/trung-du-mien-nui-phia-bac/phu-tho.json': mod([
        img('phu-tho__den', 'phu-tho', 'lich-su', 'Ảnh đền Thượng', ['trung-du-mien-nui-phia-bac__den-hung']),
      ]),
      '../../data/images/nam-bo/can-tho.json': mod([img('can-tho__cho', 'can-tho', 'van-hoa', 'Ảnh chợ nổi Cần Thơ')]),
    }),
  }
})

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

const regionList = () => screen.getByRole('list', { name: 'Các vùng địa lí' })

test('RegionList shows all regions; coming_soon ones labelled "Sắp ra mắt"', async () => {
  renderAt('/ban-do')
  await screen.findByRole('list', { name: 'Các vùng địa lí' })
  const buttons = within(regionList()).getAllByRole('button')
  expect(buttons).toHaveLength(4)
  expect(within(regionList()).getByRole('button', { name: /Đồng bằng Bắc Bộ/ })).toHaveTextContent('Sắp ra mắt')
  expect(within(regionList()).getByRole('button', { name: /Trung du và miền núi phía Bắc/ })).not.toHaveTextContent(
    'Sắp ra mắt',
  )
})

test('without selection, panel invites the student to choose a region', async () => {
  renderAt('/ban-do')
  expect(await screen.findByText('Em hãy chọn một vùng trên bản đồ để bắt đầu khám phá nhé!')).toBeInTheDocument()
})

test('clicking region button navigates and panel shows region name, intro and its outline', async () => {
  const router = renderAt('/ban-do')
  await userEvent.click(await screen.findByRole('button', { name: /Trung du và miền núi phía Bắc/ }))
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(within(panel).getByText(/vùng duy nhất của nước ta không giáp biển/)).toBeInTheDocument()
  expect(await within(panel).findByRole('navigation', { name: 'Dàn ý vùng' })).toBeInTheDocument()
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'trung-du-mien-nui-phia-bac')
})

test('selecting another topic in the modal updates ?muc= and the detail', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac?phan=dan-cu-san-xuat&muc=cac-dan-toc')
  const dialog = await screen.findByRole('dialog', { name: 'Dân cư và hoạt động sản xuất' })
  const list = within(dialog).getByRole('list', { name: 'Các mục trong phần' })
  await userEvent.click(within(list).getByRole('button', { name: /Khai thác khoáng sản/ }))
  expect(router.state.location.search).toBe('?phan=dan-cu-san-xuat&muc=khai-thac-khoang-san')
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Khai thác và sử dụng khoáng sản' })).toBeInTheDocument()
})

test('closing the modal returns to the region on the map', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=thien-nhien')
  await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
  expect(router.state.location.search).toBe('')
})

test('deep link with ?muc= opens that item and records it as viewed', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=lich-su&muc=den-hung')
  const dialog = await screen.findByRole('dialog', { name: 'Lịch sử và di tích' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Khu di tích Đền Hùng' })).toBeInTheDocument()
  await waitFor(() => expect(localStorage.getItem(PROGRESS_KEY)).toContain('trung-du-mien-nui-phia-bac__den-hung'))
})

test('unknown ?chu-de= does not open a modal', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=abc')
  await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('old /vung link redirects to the map with the topic modal open', async () => {
  const router = renderAt('/vung/trung-du-mien-nui-phia-bac?chu-de=van-hoa')
  expect(await screen.findByRole('dialog', { name: 'Văn hóa' })).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
})

test('old /dia-danh link redirects to the map with that item open', async () => {
  const router = renderAt('/dia-danh/trung-du-mien-nui-phia-bac__cot-co-lung-cu')
  const dialog = await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Cột cờ Lũng Cú' })).toBeInTheDocument()
  await waitFor(() => expect(router.state.location.search).toBe('?phan=thien-nhien&muc=vi-tri-dia-li-va-ban-do-vung&bai=cot-co-lung-cu'))
})

test('unknown /dia-danh id shows not found with link to the map', async () => {
  renderAt('/dia-danh/trung-du-mien-nui-phia-bac__xyz')
  expect(await screen.findByText('Không tìm thấy địa danh này')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về bản đồ' })).toHaveAttribute('href', '/ban-do')
})

test('selecting region on the map polygon also navigates', async () => {
  const router = renderAt('/ban-do')
  await userEvent.click(await screen.findByRole('button', { name: 'polygon-tdmnpb' }))
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
})

test('selecting region records visited progress', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(localStorage.getItem(PROGRESS_KEY)).toContain('trung-du-mien-nui-phia-bac')
})

test('coming_soon region shows "Sắp ra mắt" card', async () => {
  renderAt('/ban-do/nam-bo')
  expect(await screen.findByText('Nội dung vùng Nam Bộ đang được chuẩn bị.')).toBeInTheDocument()
})

test('selecting a province lists items of that province', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  await userEvent.click(screen.getByRole('button', { name: 'polygon-phu-tho' }))
  const list = screen.getByRole('list', { name: 'Địa danh ở tỉnh Phú Thọ' })
  await userEvent.click(within(list).getByRole('button', { name: 'Khu di tích Đền Hùng' }))
  const dialog = await screen.findByRole('dialog', { name: 'Lịch sử và di tích' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Khu di tích Đền Hùng' })).toBeInTheDocument()
})

test('selected province is shown prominently at the top of the panel', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(screen.queryByRole('region', { name: /Tỉnh đang xem/ })).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'polygon-phu-tho' }))
  const card = within(panel).getByRole('region', { name: 'Tỉnh đang xem: Phú Thọ' })
  expect(within(card).getByRole('heading', { name: 'Tỉnh Phú Thọ' })).toBeInTheDocument()
  expect(card).toHaveTextContent('Thuộc vùng Trung du và miền núi phía Bắc')
  // nằm trên dàn ý vùng để em thấy ngay
  const topics = within(panel).getByRole('navigation', { name: 'Dàn ý vùng' })
  expect(card.compareDocumentPosition(topics) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  await userEvent.click(within(card).getByRole('button', { name: 'Bỏ chọn tỉnh' }))
  expect(screen.queryByRole('region', { name: /Tỉnh đang xem/ })).not.toBeInTheDocument()
})

test('"Về bản đồ Việt Nam" clears selection', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  await userEvent.click(await screen.findByRole('button', { name: 'Về bản đồ Việt Nam' }))
  expect(router.state.location.pathname).toBe('/ban-do')
})

test('unknown region id shows not found message with link back', async () => {
  renderAt('/ban-do/khong-co')
  expect(await screen.findByText('Không tìm thấy vùng này')).toBeInTheDocument()
})

test('legend card titled "Các vùng địa lí Việt Nam" with a hint for students', async () => {
  renderAt('/ban-do')
  expect(await screen.findByRole('heading', { name: 'Các vùng địa lí Việt Nam' })).toBeInTheDocument()
  expect(screen.getByText('Nhấn vào một vùng trên bản đồ để khám phá thông tin chi tiết.')).toBeInTheDocument()
})

test('panel lists featured places with province; clicking one opens the modal at that item', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  const places = await within(panel).findByRole('list', { name: 'Một số địa điểm tiêu biểu' })
  const buttons = within(places).getAllByRole('button')
  expect(buttons.length).toBeGreaterThan(0)
  expect(buttons.length).toBeLessThanOrEqual(3)
  const fansipan = within(places).getByRole('button', { name: /Đỉnh Phan-xi-păng/ })
  expect(fansipan).toHaveTextContent('Lào Cai')
  await userEvent.click(fansipan)
  expect(router.state.location.search).toBe('?phan=thien-nhien&muc=dia-hinh&bai=dinh-phan-xi-pang')
  const dialog = await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Đỉnh Phan-xi-păng' })).toBeInTheDocument()
})

test('"Khám phá chi tiết vùng này" opens the modal at the first topic', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  await userEvent.click(await screen.findByRole('button', { name: /Khám phá chi tiết vùng này/ }))
  expect(router.state.location.search).toBe('?phan=thien-nhien&muc=vi-tri-dia-li-va-ban-do-vung')
  expect(await screen.findByRole('dialog', { name: 'Thiên nhiên' })).toBeInTheDocument()
})

test('modal: region-wide item lists the 9 provinces of the region', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=thien-nhien')
  const dialog = await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  const provinces = within(dialog).getByRole('list', { name: 'Các tỉnh trong vùng' })
  expect(within(provinces).getAllByRole('listitem')).toHaveLength(9)
  expect(provinces).toHaveTextContent('Lai Châu')
  expect(provinces).toHaveTextContent('Phú Thọ')
  expect(within(dialog).getAllByTestId('item-place')[0]).toHaveTextContent('gồm 9 tỉnh')
})

test('modal shows images of the item with credit', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=lich-su&muc=den-hung')
  const dialog = await screen.findByRole('dialog', { name: 'Lịch sử và di tích' })
  const gallery = await within(dialog).findByRole('region', { name: 'Hình ảnh' })
  expect(within(gallery).getByRole('img', { name: 'Ảnh đền Thượng' })).toBeInTheDocument()
  expect(within(gallery).getByText('Chú thích Ảnh đền Thượng')).toBeInTheDocument()
  expect(within(gallery).getByRole('link', { name: 'Wikimedia Commons' })).toHaveAttribute('href', 'https://commons.wikimedia.org/wiki/File:phu-tho__den.jpg')
})

test('modal hides image section when item has none', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=thien-nhien')
  const dialog = await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  await screen.findByRole('img', { name: 'Ảnh núi Lào Cai' })
  expect(within(dialog).queryByRole('region', { name: 'Hình ảnh' })).not.toBeInTheDocument()
})

test('region header uses cover image with credit', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(await within(panel).findByRole('img', { name: 'Ảnh núi Lào Cai' })).toBeInTheDocument()
})

test('featured place card uses item image', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const featured = await screen.findByRole('list', { name: 'Một số địa điểm tiêu biểu' })
  expect(await within(featured).findByRole('img', { name: 'Ảnh đền Thượng' })).toBeInTheDocument()
})

test('province card shows province images; none → no empty gallery', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  await screen.findByRole('img', { name: 'Ảnh núi Lào Cai' })
  await userEvent.click(screen.getByRole('button', { name: 'polygon-phu-tho' }))
  const card = screen.getByRole('region', { name: 'Tỉnh đang xem: Phú Thọ' })
  expect(within(card).getByRole('img', { name: 'Ảnh đền Thượng' })).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'polygon-lai-chau' }))
  const empty = screen.getByRole('region', { name: 'Tỉnh đang xem: Lai Châu' })
  expect(within(empty).queryByRole('img')).not.toBeInTheDocument()
})

test('coming-soon region shows its image gallery and still says content is being prepared', async () => {
  renderAt('/ban-do/nam-bo')
  expect(await screen.findByText('Nội dung vùng Nam Bộ đang được chuẩn bị.')).toBeInTheDocument()
  const gallery = await screen.findByRole('region', { name: 'Hình ảnh của vùng' })
  expect(within(gallery).getByRole('img', { name: 'Ảnh chợ nổi Cần Thơ' })).toBeInTheDocument()
})

test('province of a coming-soon region shows its images in the province card', async () => {
  renderAt('/ban-do/nam-bo')
  await screen.findByRole('region', { name: 'Hình ảnh của vùng' })
  await userEvent.click(screen.getByRole('button', { name: 'polygon-can-tho' }))
  const card = screen.getByRole('region', { name: 'Tỉnh đang xem: Cần Thơ' })
  expect(within(card).getByRole('img', { name: 'Ảnh chợ nổi Cần Thơ' })).toBeInTheDocument()
  expect(card).toHaveTextContent('Thuộc vùng Nam Bộ')
})

test('map page is full screen: no site header or footer, compact navigation in the side panel', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('complementary', { name: 'Thông tin bản đồ' })
  expect(screen.queryByRole('banner')).not.toBeInTheDocument()
  expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  const nav = within(panel).getByRole('navigation', { name: 'Điều hướng chính' })
  expect(within(nav).getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/')
  expect(within(nav).getByRole('link', { name: 'Trắc nghiệm' })).toHaveAttribute('href', '/on-tap')
  expect(within(panel).getByRole('link', { name: 'Nguồn ảnh' })).toHaveAttribute('href', '/nguon-anh')
})

test('map takes 2/3 and the side panel 1/3; the panel scrolls on its own', async () => {
  renderAt('/ban-do')
  const panel = await screen.findByRole('complementary', { name: 'Thông tin bản đồ' })
  const layout = panel.parentElement!
  expect(layout.className).toContain('lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]')
  expect(layout.className).toContain('lg:h-dvh')
  expect(panel.className).toContain('lg:overflow-y-auto')
})

test('other pages keep the site header and footer', async () => {
  renderAt('/on-tap')
  expect(await screen.findByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})

test('compact nav is a single row of four equal tabs with short labels', async () => {
  renderAt('/ban-do')
  const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' })
  const list = within(nav).getByRole('list')
  expect(list.className).toContain('grid-cols-4')
  expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Trang chủ', 'Bản đồ', 'Trắc nghiệm', 'Tiến độ'])
  expect(within(nav).getByRole('link', { name: 'Bản đồ' })).toHaveAttribute('aria-current', 'page')
})

test('legend can be collapsed to a small button and expanded again', async () => {
  renderAt('/ban-do')
  const toggle = await screen.findByRole('button', { name: 'Thu gọn bảng các vùng' })
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(toggle)
  expect(screen.queryByRole('list', { name: 'Các vùng địa lí' })).not.toBeInTheDocument()
  const open = screen.getByRole('button', { name: 'Mở bảng các vùng' })
  expect(open).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(open)
  expect(screen.getByRole('list', { name: 'Các vùng địa lí' })).toBeInTheDocument()
})

test('hint card is hidden once a region is selected', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  await screen.findByRole('list', { name: 'Các vùng địa lí' })
  expect(screen.queryByText('Nhấn vào một vùng trên bản đồ để khám phá thông tin chi tiết.')).not.toBeInTheDocument()
})

const outlineNav = async () => screen.findByRole('navigation', { name: 'Dàn ý vùng' })

test('region panel shows the outline sections in doc order with their topics', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const nav = await outlineNav()
  expect(within(nav).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
    'Thiên nhiên',
    'Dân cư và hoạt động sản xuất',
    'Văn hóa',
    'Lịch sử và di tích',
  ])
  const nature = within(nav).getByRole('list', { name: 'Thiên nhiên' })
  expect(within(nature).getAllByRole('button').map((b) => b.dataset.topic)).toEqual([
    'vi-tri-dia-li-va-ban-do-vung',
    'dia-hinh',
    'khi-hau',
    'song-ngoi',
    'khoang-san',
    'thien-nhien-va-canh-quan-tieu-bieu',
  ])
  expect(screen.queryByText('Khám phá theo chủ đề')).not.toBeInTheDocument()
})

test('topic without content is shown greyed with "đang cập nhật"', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const nav = await outlineNav()
  const people = within(nav).getByRole('list', { name: 'Dân cư và hoạt động sản xuất' })
  expect(within(people).getByRole('button', { name: /Nhà ở và bản làng/ })).toHaveTextContent('đang cập nhật')
  expect(within(people).getByRole('button', { name: /Các dân tộc/ })).not.toHaveTextContent('đang cập nhật')
})

test('clicking a topic opens the modal on that topic', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const nav = await outlineNav()
  await userEvent.click(within(nav).getByRole('button', { name: /^Địa hình/ }))
  expect(router.state.location.search).toBe('?phan=thien-nhien&muc=dia-hinh')
  const dialog = await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Địa hình đồi núi' })).toBeInTheDocument()
})

test('coming-soon region shows its outline greyed and the image gallery', async () => {
  renderAt('/ban-do/nam-bo')
  const nav = await outlineNav()
  const buttons = within(nav).getAllByRole('button')
  expect(buttons.length).toBe(25)
  for (const b of buttons) expect(b).toHaveTextContent('đang cập nhật')
  expect(await screen.findByRole('region', { name: 'Hình ảnh của vùng' })).toBeInTheDocument()
})

test('legacy ?chu-de=landmark&muc=dinh-phan-xi-pang opens the matching section and topic', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=landmark&muc=dinh-phan-xi-pang')
  const dialog = await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Đỉnh Phan-xi-păng' })).toBeInTheDocument()
  await waitFor(() => expect(router.state.location.search).toBe('?phan=thien-nhien&muc=dia-hinh&bai=dinh-phan-xi-pang'))
})

test('coming-soon region: clicking a topic opens the modal saying content is being updated', async () => {
  renderAt('/ban-do/nam-bo')
  const nav = await outlineNav()
  await userEvent.click(within(nav).getByRole('button', { name: /Chợ nổi Cái Răng/ }))
  const dialog = await screen.findByRole('dialog', { name: 'Văn hóa' })
  expect(within(dialog).getByText('Nội dung đang được cập nhật')).toBeInTheDocument()
})

test('opening a topic with two items records both as viewed', async () => {
  localStorage.clear()
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?phan=thien-nhien&muc=dia-hinh')
  await screen.findByRole('dialog', { name: 'Thiên nhiên' })
  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}') as { viewedItemIds?: string[] }
    expect(saved.viewedItemIds).toEqual(
      expect.arrayContaining(['trung-du-mien-nui-phia-bac__dia-hinh', 'trung-du-mien-nui-phia-bac__dinh-phan-xi-pang']),
    )
  })
})
