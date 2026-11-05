// Lề khi canh bản đồ toàn quốc, để bảng "Các vùng" nổi ở góc trái không che mất vùng nào

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

// Khung hẹp hơn mức này (điện thoại): chừa lề phía trên thay vì bên trái, giữ trọn chiều ngang cho bản đồ
const NARROW_FRAME = 640
const GAP = 8
const EDGE = 12

export function countryPadding(frameWidth: number, legend: LegendBox | null): CountryPadding {
  if (!legend) return { paddingTopLeft: [EDGE, EDGE], paddingBottomRight: [EDGE, EDGE] }
  const topLeft: [number, number] =
    frameWidth < NARROW_FRAME ? [EDGE, legend.top + legend.height + GAP] : [legend.left + legend.width + GAP, EDGE]
  return { paddingTopLeft: topLeft, paddingBottomRight: [EDGE, EDGE] }
}

// Chỗ cho nhãn bong bóng tên vùng đặt phía trên vùng đang chọn
const CALLOUT = 36
// Mốc lg của Tailwind: dưới mốc này trang bản đồ xếp dọc (điện thoại, máy tính bảng dựng đứng)
const STACKED_VIEWPORT = 1024

/** Màn xếp dọc: phóng vào vùng đang chọn để em chạm được từng tỉnh. Màn rộng: giữ toàn quốc (null) */
export function regionPadding(viewportWidth: number, legend: LegendBox | null): CountryPadding | null {
  if (viewportWidth >= STACKED_VIEWPORT) return null
  const top = (legend ? legend.top + legend.height + GAP : EDGE) + CALLOUT
  return { paddingTopLeft: [EDGE, top], paddingBottomRight: [EDGE, EDGE] }
}
