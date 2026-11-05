import { countryPadding, regionPadding } from './fit'

const legend = { left: 16, top: 16, width: 170, height: 40 }

test('wide map frame: leave room on the left for the legend', () => {
  expect(countryPadding(1100, legend)).toEqual({ paddingTopLeft: [194, 12], paddingBottomRight: [12, 12] })
})

test('narrow map frame (phone): leave room above the legend instead, so the map keeps its full width', () => {
  expect(countryPadding(375, legend)).toEqual({ paddingTopLeft: [12, 64], paddingBottomRight: [12, 12] })
})

test('no legend: small even padding', () => {
  expect(countryPadding(375, null)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
})

test('regionPadding: below the lg breakpoint (stacked layout: phones, portrait tablets) zoom into the selected region, leaving room for the legend and the callout above it', () => {
  expect(regionPadding(1024, legend)).toBeNull()
  expect(regionPadding(768, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 12] })
  expect(regionPadding(375, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 12] })
  expect(regionPadding(375, null)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 12] })
})
