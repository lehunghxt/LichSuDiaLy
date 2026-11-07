// Canh khung nhìn của bản đồ (toàn quốc), dùng chung cho các lớp và nút điều khiển
import L, { type LatLngBoundsExpression } from 'leaflet'
import type { Device } from '../../../lib/device'
import { countryPadding } from '../fit'

// Khung nhìn toàn quốc, gồm cả Hoàng Sa và Trường Sa
export const VIETNAM_BOUNDS: LatLngBoundsExpression = [
  [7.6, 102.0],
  [23.5, 117.9],
]

/** Canh toàn quốc, chừa chỗ cho bảng chú giải nổi góc trái (đo thật vì cỡ chữ đổi theo màn hình) */
export function legendBox(map: L.Map) {
  const legend = map.getContainer().closest('[data-map-frame]')?.querySelector<HTMLElement>('[data-map-legend]')
  return legend ? { left: legend.offsetLeft, top: legend.offsetTop, width: legend.offsetWidth, height: legend.offsetHeight } : null
}

export function fitCountry(map: L.Map, device: Device) {
  const { clientHeight } = map.getContainer()
  map.fitBounds(VIETNAM_BOUNDS, countryPadding(device, clientHeight, legendBox(map)))
}
