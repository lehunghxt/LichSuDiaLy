import { countryPadding, regionPadding } from './fit'

const legend = { left: 16, top: 16, width: 170, height: 40 }
// Bảng "Các vùng" đang mở: cao hơn nhiều
const openLegend = { left: 16, top: 16, width: 220, height: 240 }

test('wide map frame: the region chips run along the top edge, so leave room above, not on the left', () => {
  expect(countryPadding(1280, 700, { left: 12, top: 12, width: 760, height: 48 })).toEqual({
    paddingTopLeft: [12, 68],
    paddingBottomRight: [12, 12],
  })
})

test('narrow map frame (phone): leave room above the legend instead, so the map keeps its full width', () => {
  expect(countryPadding(1280, 500, legend)).toEqual({ paddingTopLeft: [12, 64], paddingBottomRight: [12, 12] })
})

test('no legend: small even padding', () => {
  expect(countryPadding(1280, 500, null)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
})

test('narrow and short frame with the legend open: padding never eats most of the frame, the legend floats over the map', () => {
  expect(countryPadding(1280, 253, openLegend)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
})

test('regionPadding: below the lg breakpoint (stacked layout: phones, portrait tablets) zoom into the selected region, leaving room for the legend and the callout above it', () => {
  expect(regionPadding(1024, 600, legend)).toBeNull()
  expect(regionPadding(768, 600, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 330] })
  expect(regionPadding(375, 500, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 275] })
  expect(regionPadding(375, 500, null)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 275] })
})

test('regionPadding: landscape phone with the legend open keeps a usable frame (only the callout room is reserved)', () => {
  // 844×390 ngang: khung bản đồ 65vh ≈ 253px, bảng mở cao 240px
  expect(regionPadding(844, 253, openLegend)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 139] })
})

test('phones: the whole country only leaves room for the bottom tab bar; a chosen region also leaves room for the half-open sheet', () => {
  expect(countryPadding(375, 800, null)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 76] })
  // tab bar 64 + sheet 45% of 800 = 424
  expect(regionPadding(375, 800, null)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 424] })
  expect(countryPadding(1280, 800, null)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
})
