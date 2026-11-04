import { fireEvent, render, screen, within } from '@testing-library/react'
import { MapContainer } from 'react-leaflet'
import { LocationMarkers } from './LocationMarkers'
import { placesOf, type Place } from './places'

const denHung: Place = {
  id: 'trung-du-mien-nui-phia-bac__den-hung',
  title: 'Khu di tích Đền Hùng',
  section: 'lich-su',
  location: { lat: 21.3655, lng: 105.3246, placeName: 'Khu di tích Đền Hùng' },
}
const lungCu: Place = {
  id: 'trung-du-mien-nui-phia-bac__cot-co-lung-cu',
  title: 'Cột cờ Lũng Cú',
  section: 'thien-nhien',
  location: { lat: 23.3637, lng: 105.3162, placeName: 'Cột cờ Lũng Cú' },
}

const renderMarkers = (places: Place[], onOpen = vi.fn()) => {
  render(
    <MapContainer center={[21, 105]} zoom={6} style={{ height: 400, width: 600 }}>
      <LocationMarkers places={places} onOpen={onOpen} />
    </MapContainer>,
  )
  return onOpen
}

test('placesOf keeps only items that have a location', () => {
  const noLocation = { id: 'x__khi-hau', title: 'Khí hậu', section: 'thien-nhien' as const }
  expect(placesOf([denHung, noLocation, lungCu])).toEqual([denHung, lungCu])
})

test('one keyboard-reachable marker per place, named by its title', () => {
  renderMarkers([denHung, lungCu])
  const markers = screen.getAllByRole('button', { name: /^Địa điểm:/ })
  expect(markers.map((m) => m.getAttribute('aria-label'))).toEqual(['Địa điểm: Khu di tích Đền Hùng', 'Địa điểm: Cột cờ Lũng Cú'])
  for (const m of markers) expect(m).toHaveAttribute('tabindex', '0')
})

test('clicking a marker shows a popup with title, section and a "Xem chi tiết" button that opens the item', () => {
  const onOpen = renderMarkers([denHung, lungCu])
  fireEvent.click(screen.getByRole('button', { name: 'Địa điểm: Khu di tích Đền Hùng' }))
  const popup = screen.getByRole('dialog', { name: 'Khu di tích Đền Hùng' })
  expect(popup).toHaveTextContent('Lịch sử và di tích')
  fireEvent.click(within(popup).getByRole('button', { name: 'Xem chi tiết' }))
  expect(onOpen).toHaveBeenCalledWith(denHung)
})

test('no places → no markers', () => {
  renderMarkers([])
  expect(screen.queryAllByRole('button', { name: /^Địa điểm:/ })).toEqual([])
})
