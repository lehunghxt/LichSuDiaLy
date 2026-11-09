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

/** Lề khi phóng vào một khu vực ở điện thoại, máy tính bảng: tránh khung thông tin (bottom sheet nửa màn hình,
 *  khung nổi bên phải) và thanh tab; `top` là lề phía trên */
function besidePanel(device: 'mobile' | 'tablet', frameHeight: number, top: number): CountryPadding {
  if (device === 'tablet') return { paddingTopLeft: [EDGE, top], paddingBottomRight: [SIDE_PANEL + 2 * EDGE, TAB_BAR + EDGE] }
  // Chừa thanh tab và bottom sheet đang mở nửa màn hình, để khu vực nằm gọn phía trên tấm
  const bottom = Math.min(TAB_BAR + Math.round(frameHeight * HALF_SHEET), Math.round(frameHeight * MAX_BOTTOM_SHARE))
  return { paddingTopLeft: [EDGE, top], paddingBottomRight: [EDGE, bottom] }
}

/** Mọi thiết bị: phóng vào vùng đang chọn để các tỉnh và địa danh không chồng lên nhau, chừa chỗ cho nhãn tên vùng.
 *  Điện thoại, máy tính bảng còn tránh phần khung thông tin che; desktop có khung thông tin nằm cạnh bản đồ */
export function regionPadding(device: Device, frameHeight: number, legend: LegendBox | null): CountryPadding {
  const top = (belowLegend(frameHeight, legend) ?? EDGE) + CALLOUT
  if (device === 'desktop') return { paddingTopLeft: [EDGE, top], paddingBottomRight: [EDGE, EDGE] }
  return besidePanel(device, frameHeight, top)
}

/** Mức phóng tối đa khi chọn tỉnh: tỉnh nhỏ (Hà Nội, Huế…) vẫn thấy được các tỉnh xung quanh */
export const PROVINCE_MAX_ZOOM = 8

// Desktop: chừa thêm phần này của chiều cao khung quanh tỉnh đang chọn, để em vẫn thấy tỉnh nằm ở đâu trong vùng
const PROVINCE_CONTEXT = 0.15

/** Chọn một tỉnh: mọi thiết bị đều phóng vào tỉnh đó. Tên tỉnh ghim ngay giữa tỉnh nên không cần chừa chỗ nhãn vùng */
export function provinceFit(device: Device, frameHeight: number, legend: LegendBox | null): CountryPadding & { maxZoom: number } {
  if (device !== 'desktop') {
    return { ...besidePanel(device, frameHeight, belowLegend(frameHeight, legend) ?? EDGE), maxZoom: PROVINCE_MAX_ZOOM }
  }
  const { paddingTopLeft, paddingBottomRight } = countryPadding(device, frameHeight, legend)
  const more = Math.round(frameHeight * PROVINCE_CONTEXT)
  return {
    paddingTopLeft: [paddingTopLeft[0] + more, paddingTopLeft[1] + more],
    paddingBottomRight: [paddingBottomRight[0] + more, paddingBottomRight[1] + more],
    maxZoom: PROVINCE_MAX_ZOOM,
  }
}
