import { countryPadding, regionPadding } from './fit'

const legend = { left: 16, top: 16, width: 170, height: 40 }
// Dải chip cao bất thường (ví dụ chữ phóng to)
const openLegend = { left: 16, top: 16, width: 220, height: 240 }

describe('desktop', () => {
  test('the region chips run along the top edge, so leave room above them', () => {
    expect(countryPadding('desktop', 700, { left: 12, top: 12, width: 760, height: 48 })).toEqual({
      paddingTopLeft: [12, 68],
      paddingBottomRight: [12, 12],
    })
    expect(countryPadding('desktop', 500, legend)).toEqual({ paddingTopLeft: [12, 64], paddingBottomRight: [12, 12] })
  })

  test('no chips: small even padding; very tall chips float over the map instead of squeezing it', () => {
    expect(countryPadding('desktop', 500, null)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
    expect(countryPadding('desktop', 253, openLegend)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 12] })
  })

  test('choosing a region keeps the whole country in view (the panel is beside the map)', () => {
    expect(regionPadding('desktop', 600, legend)).toBeNull()
  })
})

describe('mobile', () => {
  test('the whole country only leaves room for the bottom tab bar', () => {
    expect(countryPadding('mobile', 800, null)).toEqual({ paddingTopLeft: [12, 12], paddingBottomRight: [12, 76] })
  })

  test('a chosen region is zoomed in above the half-open bottom sheet and below the chips and callout', () => {
    // tab bar 64 + sheet 45% of 800 = 424
    expect(regionPadding('mobile', 800, null)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 424] })
    expect(regionPadding('mobile', 500, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 275] })
  })

  test('landscape phone: the bottom room is capped so some map stays visible', () => {
    expect(regionPadding('mobile', 390, openLegend)).toEqual({ paddingTopLeft: [12, 48], paddingBottomRight: [12, 215] })
  })
})

describe('tablet', () => {
  test('the whole country only leaves room for the bottom tab bar', () => {
    expect(countryPadding('tablet', 1000, legend)).toEqual({ paddingTopLeft: [12, 64], paddingBottomRight: [12, 76] })
  })

  test('a chosen region is zoomed in to the left of the floating side panel and above the tab bar', () => {
    // khung nổi 380 + lề 12 hai bên = 404
    expect(regionPadding('tablet', 1000, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [404, 76] })
  })
})
