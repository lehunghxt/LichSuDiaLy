// Lề khi canh bản đồ, để dải chip "Các vùng" ở mép trên không che mất vùng nào

export interface LegendBox {
  left: number
  top: number
  width: number
  height: number
}

// Mốc lg của Tailwind: dưới mốc này dùng bố cục điện thoại (bản đồ toàn màn hình, thanh tab ở đáy, thông tin vùng trong bottom sheet)
export const STACKED_VIEWPORT = 1024
// Chiều cao thanh tab dính đáy màn hình ở bố cục điện thoại
export const TAB_BAR = 64
// Bottom sheet ở mức "nửa màn hình" cao bằng phần này của màn hình
export const HALF_SHEET = 0.45
// Phần chừa ở đáy không quá chừng này của khung (điện thoại xoay ngang vẫn còn chỗ thấy bản đồ)
const MAX_BOTTOM_SHARE = 0.55

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

export function countryPadding(viewportWidth: number, frameHeight: number, legend: LegendBox | null): CountryPadding {
  return {
    paddingTopLeft: [EDGE, belowLegend(frameHeight, legend) ?? EDGE],
    // Điện thoại: chưa chọn vùng thì chưa có bottom sheet, chỉ chừa thanh tab
    paddingBottomRight: [EDGE, viewportWidth < STACKED_VIEWPORT ? TAB_BAR + EDGE : EDGE],
  }
}

// Chỗ cho nhãn bong bóng tên vùng đặt phía trên vùng đang chọn
const CALLOUT = 36

/** Màn xếp dọc: phóng vào vùng đang chọn để em chạm được từng tỉnh. Màn rộng: giữ toàn quốc (null) */
export function regionPadding(viewportWidth: number, frameHeight: number, legend: LegendBox | null): CountryPadding | null {
  if (viewportWidth >= STACKED_VIEWPORT) return null
  const top = (belowLegend(frameHeight, legend) ?? EDGE) + CALLOUT
  // Chừa thanh tab và bottom sheet đang mở nửa màn hình, để vùng nằm gọn phía trên tấm
  const bottom = Math.min(TAB_BAR + Math.round(frameHeight * HALF_SHEET), Math.round(frameHeight * MAX_BOTTOM_SHARE))
  return { paddingTopLeft: [EDGE, top], paddingBottomRight: [EDGE, bottom] }
}
