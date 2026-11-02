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
    </div>
  ),
}))

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

test('clicking region button navigates and panel shows region name, intro and 5 topic buttons', async () => {
  const router = renderAt('/ban-do')
  await userEvent.click(await screen.findByRole('button', { name: /Trung du và miền núi phía Bắc/ }))
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(within(panel).getByText(/vùng duy nhất của nước ta không giáp biển/)).toBeInTheDocument()
  for (const label of ['Đặc điểm tự nhiên', 'Lễ hội và văn hóa', 'Khoáng sản', 'Danh lam thắng cảnh', 'Di tích lịch sử']) {
    expect(within(panel).getByRole('button', { name: new RegExp(label) })).toBeInTheDocument()
  }
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'trung-du-mien-nui-phia-bac')
})

test('clicking a topic stays on the map page and opens the fullscreen topic modal', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  await userEvent.click(await within(panel).findByRole('button', { name: /Khoáng sản/ }))
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
  expect(router.state.location.search).toBe('?chu-de=mineral')
  const dialog = await screen.findByRole('dialog', { name: 'Khoáng sản' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Tài nguyên khoáng sản' })).toBeInTheDocument()
  expect(within(dialog).getByText(/sắt, a-pa-tít \(apatite\), đá vôi/)).toBeInTheDocument()
})

test('selecting another item in the modal updates ?muc= and the detail', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=mineral')
  const dialog = await screen.findByRole('dialog', { name: 'Khoáng sản' })
  const list = within(dialog).getByRole('list', { name: 'Các mục trong chủ đề' })
  await userEvent.click(within(list).getByRole('button', { name: 'Khai thác và sử dụng khoáng sản' }))
  expect(router.state.location.search).toBe('?chu-de=mineral&muc=su-dung-khoang-san')
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Khai thác và sử dụng khoáng sản' })).toBeInTheDocument()
})

test('closing the modal returns to the region on the map', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=natural')
  await screen.findByRole('dialog', { name: 'Đặc điểm tự nhiên' })
  await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
  expect(router.state.location.search).toBe('')
})

test('deep link with ?muc= opens that item and records it as viewed', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=historical_site&muc=den-hung')
  const dialog = await screen.findByRole('dialog', { name: 'Di tích lịch sử' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Khu di tích Đền Hùng' })).toBeInTheDocument()
  await waitFor(() => expect(localStorage.getItem(PROGRESS_KEY)).toContain('trung-du-mien-nui-phia-bac__den-hung'))
})

test('unknown ?chu-de= does not open a modal', async () => {
  renderAt('/ban-do/trung-du-mien-nui-phia-bac?chu-de=abc')
  await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(screen.queryByRole('dialog')).toBeNull()
})

test('old /vung link redirects to the map with the topic modal open', async () => {
  const router = renderAt('/vung/trung-du-mien-nui-phia-bac?chu-de=culture')
  expect(await screen.findByRole('dialog', { name: 'Lễ hội và văn hóa' })).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
})

test('old /dia-danh link redirects to the map with that item open', async () => {
  const router = renderAt('/dia-danh/trung-du-mien-nui-phia-bac__cot-co-lung-cu')
  const dialog = await screen.findByRole('dialog', { name: 'Danh lam thắng cảnh' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Cột cờ Lũng Cú' })).toBeInTheDocument()
  expect(router.state.location.search).toBe('?chu-de=landmark&muc=cot-co-lung-cu')
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
  const dialog = await screen.findByRole('dialog', { name: 'Di tích lịch sử' })
  expect(within(dialog).getByRole('heading', { level: 3, name: 'Khu di tích Đền Hùng' })).toBeInTheDocument()
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
  expect(router.state.location.search).toBe('?chu-de=landmark&muc=dinh-phan-xi-pang')
  expect(await screen.findByRole('dialog', { name: 'Danh lam thắng cảnh' })).toBeInTheDocument()
})

test('"Khám phá chi tiết vùng này" opens the modal at the first topic', async () => {
  const router = renderAt('/ban-do/trung-du-mien-nui-phia-bac')
  await userEvent.click(await screen.findByRole('button', { name: /Khám phá chi tiết vùng này/ }))
  expect(router.state.location.search).toBe('?chu-de=natural')
  expect(await screen.findByRole('dialog', { name: 'Đặc điểm tự nhiên' })).toBeInTheDocument()
})
