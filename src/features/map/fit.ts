import { HALF_SHEET, TAB_BAR } from '../../components/sheet/sizes'
import type { Device } from '../../lib/device'

// Lề khi canh bản đồ, để dải chip "Các vùng" ở mép trên không che mất vùng nào

export interface LegendBox {
  left: number
  top: number
  width: number
  height: number
}

// Phần chừa ở đáy không quá chừng này của khung (điện thoại xoay ngang vẫn còn chỗ thấy bản đồ)
const MAX_BOTTOM_SHARE = 0.55
/** Giới hạn kéo bản đồ [[nam, tây], [bắc, đông]]: đủ rộng để khung phóng vào mọi vùng (kể cả lề chừa cho khung thông tin)
 *  không chạm giới hạn; chạm thì Leaflet kéo bản đồ lệch và vùng bị khung che */
export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-30, 70],
  [45, 140],
]
// Máy tính bảng: bề rộng khung thông tin nổi ở mép phải bản đồ
export const SIDE_PANEL = 380

export interface CountryPadding {
  paddingTopLeft: [number, number]
  paddingBottomRight: [number, number]
}

const GAP = 8
const EDGE = 12

// Lề phía trên chừa cho dải chip không được quá phần này của chiều cao khung (màn thấp, chip xuống nhiều hàng):
// quá thì để bảng nổi đè lên bản đồ, còn hơn khung nhìn bị bóp tới mức Leaflet phóng sai
const MAX_TOP_SHARE = 0.35

/** Lề phía trên dưới bảng, hoặc null nếu bảng quá cao so với khung */
function belowLegend(frameHeight: number, legend: LegendBox | null): number | null {
  if (!legend) return null
  const top = legend.top + legend.height + GAP
  return top <= frameHeight * MAX_TOP_SHARE ? top : null
}

export function countryPadding(device: Device, frameHeight: number, legend: LegendBox | null): CountryPadding {
  return {
    paddingTopLeft: [EDGE, belowLegend(frameHeight, legend) ?? EDGE],
    // Điện thoại, máy tính bảng: chưa chọn vùng thì chưa có khung thông tin, chỉ chừa thanh tab
    paddingBottomRight: [EDGE, device === 'desktop' ? EDGE : TAB_BAR + EDGE],
  }
}

// Chỗ cho nhãn bong bóng tên vùng đặt phía trên vùng đang chọn
const CALLOUT = 36

/** Điện thoại, máy tính bảng: phóng vào vùng đang chọn để em chạm được từng tỉnh, tránh phần khung thông tin che.
 *  Desktop: khung thông tin nằm cạnh bản đồ, giữ toàn quốc (null) */
export function regionPadding(device: Device, frameHeight: number, legend: LegendBox | null): CountryPadding | null {
  if (device === 'desktop') return null
  const top = (belowLegend(frameHeight, legend) ?? EDGE) + CALLOUT
  if (device === 'tablet') return { paddingTopLeft: [EDGE, top], paddingBottomRight: [SIDE_PANEL + 2 * EDGE, TAB_BAR + EDGE] }
  // Chừa thanh tab và bottom sheet đang mở nửa màn hình, để vùng nằm gọn phía trên tấm
  const bottom = Math.min(TAB_BAR + Math.round(frameHeight * HALF_SHEET), Math.round(frameHeight * MAX_BOTTOM_SHARE))
  return { paddingTopLeft: [EDGE, top], paddingBottomRight: [EDGE, bottom] }
}
