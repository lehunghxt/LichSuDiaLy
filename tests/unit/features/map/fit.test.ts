import { readFileSync } from 'node:fs'
import path from 'node:path'
import L from 'leaflet'
import type { Device } from '../../../../src/lib/device'
import { MAP_MAX_BOUNDS, PROVINCE_MAX_ZOOM, countryPadding, provinceFit, regionPadding } from '../../../../src/features/map/fit'
import { regionBounds, type AreaCollection, type RegionFeatureProps } from '../../../../src/features/map/geo'

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

  test('a chosen region is zoomed in below the chips and callout (the panel is beside the map)', () => {
    // chip: 16 + 40 + 8 = 64, nhãn vùng 36
    expect(regionPadding('desktop', 600, legend)).toEqual({ paddingTopLeft: [12, 100], paddingBottomRight: [12, 12] })
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

describe('a chosen province is zoomed in on every device', () => {
  test('desktop: room for the chips, plus a margin so the neighbouring provinces stay in view', () => {
    // thêm 15% của 500 = 75 mỗi phía
    expect(provinceFit('desktop', 500, legend)).toEqual({
      paddingTopLeft: [87, 139],
      paddingBottomRight: [87, 87],
      maxZoom: PROVINCE_MAX_ZOOM,
    })
  })

  test('mobile: above the half-open bottom sheet (no region callout to leave room for)', () => {
    expect(provinceFit('mobile', 800, null)).toEqual({
      paddingTopLeft: [12, 12],
      paddingBottomRight: [12, 424],
      maxZoom: PROVINCE_MAX_ZOOM,
    })
  })

  test('tablet: to the left of the floating side panel and above the tab bar', () => {
    expect(provinceFit('tablet', 1000, legend)).toEqual({
      paddingTopLeft: [12, 64],
      paddingBottomRight: [404, 76],
      maxZoom: PROVINCE_MAX_ZOOM,
    })
  })

  test('small provinces are not zoomed in so far that their surroundings disappear', () => {
    expect(PROVINCE_MAX_ZOOM).toBeGreaterThanOrEqual(8)
    expect(PROVINCE_MAX_ZOOM).toBeLessThanOrEqual(10)
  })
})

describe('every region fits its zoom without hitting the pan limit', () => {
  // Leaflet chặn không cho khung nhìn ra ngoài MAP_MAX_BOUNDS: nếu khung phóng cần vượt giới hạn, bản đồ bị kéo lệch
  // và vùng đang chọn nằm dưới khung thông tin. Tính lại khung nhìn như map.fitBounds (zoomSnap 0.25)
  const data = JSON.parse(
    readFileSync(path.resolve(import.meta.dirname, '../../../../public/maps/regions.geojson'), 'utf8'),
  ) as AreaCollection<RegionFeatureProps>
  const crs = L.CRS.EPSG3857
  const [[minLat, minLng], [maxLat, maxLng]] = MAP_MAX_BOUNDS

  const screens: [Device, number, number][] = [
    ['desktop', 990, 900],
    ['desktop', 853, 700],
    ['mobile', 390, 800],
    ['mobile', 360, 640],
    ['tablet', 820, 1100],
    ['tablet', 1000, 760],
  ]
  for (const [device, width, height] of screens) {
    for (const region of data.features.map((f) => f.properties.regionId)) {
      test(`${device} ${width}×${height}: ${region}`, () => {
        const pad = regionPadding(device, height, legend)
        const [[s, w], [n, e]] = regionBounds(data, region)!
        const [padL, padT] = pad.paddingTopLeft
        const [padR, padB] = pad.paddingBottomRight
        let zoom = 10
        for (; zoom > 4; zoom -= 0.25) {
          const sw = crs.latLngToPoint(L.latLng(s, w), zoom)
          const ne = crs.latLngToPoint(L.latLng(n, e), zoom)
          if (ne.x - sw.x <= width - padL - padR && sw.y - ne.y <= height - padT - padB) break
        }
        const sw = crs.latLngToPoint(L.latLng(s, w), zoom)
        const ne = crs.latLngToPoint(L.latLng(n, e), zoom)
        const center = sw
          .add(ne)
          .divideBy(2)
          .add(L.point(padR - padL, padB - padT).divideBy(2))
        const topLeft = crs.pointToLatLng(center.subtract(L.point(width / 2, height / 2)), zoom)
        const bottomRight = crs.pointToLatLng(center.add(L.point(width / 2, height / 2)), zoom)
        expect(topLeft.lat).toBeLessThanOrEqual(maxLat)
        expect(topLeft.lng).toBeGreaterThanOrEqual(minLng)
        expect(bottomRight.lat).toBeGreaterThanOrEqual(minLat)
        expect(bottomRight.lng).toBeLessThanOrEqual(maxLng)
      })
    }
  }
})
