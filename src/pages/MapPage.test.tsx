import { render, screen, within } from '@testing-library/react'
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

test('clicking region button navigates and panel shows region name, intro and 5 topics', async () => {
  const router = renderAt('/ban-do')
  await userEvent.click(await screen.findByRole('button', { name: /Trung du và miền núi phía Bắc/ }))
  expect(router.state.location.pathname).toBe('/ban-do/trung-du-mien-nui-phia-bac')
  const panel = await screen.findByRole('region', { name: 'Trung du và miền núi phía Bắc' })
  expect(within(panel).getByText(/vùng duy nhất không giáp biển/)).toBeInTheDocument()
  for (const label of ['Đặc điểm tự nhiên', 'Lễ hội và văn hóa', 'Khoáng sản', 'Danh lam thắng cảnh', 'Di tích lịch sử']) {
    expect(within(panel).getByRole('link', { name: new RegExp(label) })).toHaveAttribute(
      'href',
      expect.stringContaining('/vung/trung-du-mien-nui-phia-bac?chu-de='),
    )
  }
  expect(screen.getByTestId('map')).toHaveAttribute('data-selected', 'trung-du-mien-nui-phia-bac')
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
  expect(within(list).getByRole('link', { name: 'Khu di tích Đền Hùng' })).toHaveAttribute(
    'href',
    '/dia-danh/trung-du-mien-nui-phia-bac__den-hung',
  )
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
