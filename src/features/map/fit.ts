// Lề khi canh bản đồ, để dải chip "Các vùng" ở mép trên không che mất vùng nào

export interface LegendBox {
  left: number
  top: number
  width: number
  height: number
}

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

export function countryPadding(frameHeight: number, legend: LegendBox | null): CountryPadding {
  return { paddingTopLeft: [EDGE, belowLegend(frameHeight, legend) ?? EDGE], paddingBottomRight: [EDGE, EDGE] }
}

// Chỗ cho nhãn bong bóng tên vùng đặt phía trên vùng đang chọn
const CALLOUT = 36
// Mốc lg của Tailwind: dưới mốc này trang bản đồ xếp dọc (điện thoại, máy tính bảng dựng đứng)
const STACKED_VIEWPORT = 1024

/** Màn xếp dọc: phóng vào vùng đang chọn để em chạm được từng tỉnh. Màn rộng: giữ toàn quốc (null) */
export function regionPadding(viewportWidth: number, frameHeight: number, legend: LegendBox | null): CountryPadding | null {
  if (viewportWidth >= STACKED_VIEWPORT) return null
  const top = (belowLegend(frameHeight, legend) ?? EDGE) + CALLOUT
  return { paddingTopLeft: [EDGE, top], paddingBottomRight: [EDGE, EDGE] }
}
