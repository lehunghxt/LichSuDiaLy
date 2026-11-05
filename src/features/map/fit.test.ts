import { countryPadding, regionPadding } from './fit'

const legend = { left: 16, top: 16, width: 170, height: 40 }
// Bảng "Các vùng" đang mở: cao hơn nhiều
const openLegend = { left: 16, top: 16, width: 220, height: 240 }

test('wide map frame: leave room on the left for the legend', () => {
  expect(countryPadding(1100, 700, legend)).toEqual({ paddingTopLeft: [194, 12], paddingBottomRight: [12, 12] })
})

test('narrow map frame (phone): leave room above the legend instead, so the map keeps its full width', () => {
  expect(countryPadding(375, 500, legend)).toEqual({ paddingTopLeft: [12, 64], paddingBottomRight: [12, 12] })
})

test('no legend: small even padding', () => {
  expect(countryPadding(375, 500, null)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
})

test('narrow and short frame with the legend open: padding never eats most of the frame, the legend floats over the map', () => {
  expect(countryPadding(375, 253, openLegend)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
})

test('regionPadding: below the lg breakpoint (stacked layout: phones, portrait tablets) zoom into the selected region, leaving room for the legend and the callout above it', () => {
  expect(regionPadding(1024, 600, legend)).toBeNull()
  expect(regionPadding(768, 600, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 12] })
  expect(regionPadding(375, 500, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 12] })
  expect(regionPadding(375, 500, null)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 12] })
})

test('regionPadding: landscape phone with the legend open keeps a usable frame (only the callout room is reserved)', () => {
  // 844×390 ngang: khung bản đồ 65vh ≈ 253px, bảng mở cao 240px
  expect(regionPadding(844, 253, openLegend)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 12] })
})
