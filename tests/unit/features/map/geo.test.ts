import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  createGeoLoader,
  isProvinceCollection,
  isRegionCollection,
  regionBounds,
  splitOffshore,
  type AreaCollection,
  type ProvinceFeatureProps,
  type RegionFeatureProps,
} from '../../../../src/features/map/geo'

const mapsDir = path.resolve(import.meta.dirname, '../../../../public/maps')
const readJson = (f: string): unknown => JSON.parse(readFileSync(path.join(mapsDir, f), 'utf8'))

const regionFc = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { regionId: 'vung-a' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ],
        ],
      },
    },
  ],
}

function fetchOk(body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }))
}

test('isRegionCollection rejects missing regionId in properties', () => {
  expect(isRegionCollection(regionFc)).toBe(true)
  expect(isRegionCollection({ ...regionFc, features: [{ ...regionFc.features[0], properties: {} }] })).toBe(false)
  expect(isRegionCollection({ type: 'Feature' })).toBe(false)
})

test('loadRegions returns {ok:false, reason:"network"} when fetch rejects', async () => {
  const loader = createGeoLoader(vi.fn(async () => Promise.reject(new TypeError('offline'))))
  expect(await loader.loadRegions()).toEqual({ ok: false, reason: 'network' })
})

test('loadRegions returns network error on HTTP 404', async () => {
  const loader = createGeoLoader(vi.fn(async () => new Response('', { status: 404 })))
  expect(await loader.loadRegions()).toEqual({ ok: false, reason: 'network' })
})

test('loadRegions returns {ok:false, reason:"invalid"} on non-GeoJSON body', async () => {
  const loader = createGeoLoader(fetchOk({ hello: 1 }))
  expect(await loader.loadRegions()).toEqual({ ok: false, reason: 'invalid' })
})

test('loadRegions caches successful result, retries after failure', async () => {
  let fail = true
  const fetcher = vi.fn(async () => (fail ? Promise.reject(new TypeError('x')) : new Response(JSON.stringify(regionFc))))
  const loader = createGeoLoader(fetcher)
  expect((await loader.loadRegions()).ok).toBe(false)
  fail = false
  expect((await loader.loadRegions()).ok).toBe(true)
  await loader.loadRegions()
  expect(fetcher).toHaveBeenCalledTimes(2)
})

test('public/maps/regions.geojson: every regionId exists in regions.json', () => {
  const regions = readJson('regions.geojson')
  expect(isRegionCollection(regions)).toBe(true)
  const known = (JSON.parse(readFileSync(path.resolve(mapsDir, '../../src/data/regions.json'), 'utf8')) as { id: string }[]).map(
    (r) => r.id,
  )
  if (isRegionCollection(regions)) {
    expect(regions.features.map((f) => f.properties.regionId).sort()).toEqual([...known].sort())
  }
})

test('public/maps/provinces.geojson has 34 provinces, 9 in Trung du và miền núi phía Bắc', () => {
  const provinces = readJson('provinces.geojson')
  expect(isProvinceCollection(provinces)).toBe(true)
  if (isProvinceCollection(provinces)) {
    expect(provinces.features).toHaveLength(34)
    expect(provinces.features.filter((f) => f.properties.regionId === 'trung-du-mien-nui-phia-bac')).toHaveLength(9)
  }
})

test('provinces data keeps Hoàng Sa and Trường Sa islands', () => {
  const provinces = readJson('provinces.geojson')
  if (!isProvinceCollection(provinces)) throw new Error('invalid')
  const offshore = (id: string) => {
    const g = provinces.features.find((f) => f.properties.provinceId === id)?.geometry
    const polys = g?.type === 'MultiPolygon' ? g.coordinates : []
    return polys.filter((p) => Math.min(...(p[0] ?? []).map((c) => c[0] ?? 0)) > 110).length
  }
  expect(offshore('da-nang')).toBeGreaterThan(0)
  expect(offshore('khanh-hoa')).toBeGreaterThan(0)
})

const sq = (lng: number, lat: number, d = 0.1) => [
  [
    [lng, lat],
    [lng + d, lat],
    [lng + d, lat + d],
    [lng, lat + d],
    [lng, lat],
  ],
]

test('splitOffshore moves archipelago parts into their own feature, keeping mainland and coastal islands together', () => {
  const fc: AreaCollection<RegionFeatureProps> = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { regionId: 'r' },
        geometry: {
          type: 'MultiPolygon',
          // đất liền, đảo ven bờ (Phú Quý), Trường Sa (đông 109,6°), bãi phía nam (đông 109°, nam 10°)
          coordinates: [sq(108.5, 12, 0.9), sq(108.9, 10.5), sq(114, 9), sq(109.5, 7.3)],
        },
      },
    ],
  }
  const out = splitOffshore(fc)
  expect(out.features.map((f) => [f.properties.regionId, f.properties.offshore, f.geometry.coordinates.length])).toEqual([
    ['r', false, 2],
    ['r', true, 2],
  ])
})

test('splitOffshore leaves features without offshore parts as a single mainland feature', () => {
  const fc: AreaCollection<RegionFeatureProps> = {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: { regionId: 'a' }, geometry: { type: 'Polygon', coordinates: sq(105, 21) } }],
  }
  expect(splitOffshore(fc).features).toEqual([
    { type: 'Feature', properties: { regionId: 'a', offshore: false }, geometry: { type: 'MultiPolygon', coordinates: [sq(105, 21)] } },
  ])
})

test('real map data: Hoàng Sa and Trường Sa are split off from Đà Nẵng and Khánh Hòa, nothing else is', () => {
  const provinces = readJson('provinces.geojson') as AreaCollection<ProvinceFeatureProps>
  const offshore = splitOffshore(provinces).features.filter((f) => f.properties.offshore)
  expect(offshore.map((f) => f.properties.provinceId).sort()).toEqual(['da-nang', 'khanh-hoa'])
})

test('regionBounds covers the whole region including Hoàng Sa and Trường Sa, so zooming in never crops the archipelagos', () => {
  const data = readJson('regions.geojson') as AreaCollection<RegionFeatureProps>
  const [[south, west], [north, east]] = regionBounds(data, 'bac-trung-bo-va-nam-trung-bo')!
  expect(east).toBeGreaterThan(116) // Trường Sa xa nhất về phía đông
  expect(south).toBeLessThan(9) // Trường Sa xa nhất về phía nam
  expect(north).toBeGreaterThan(19.5) // Thanh Hoá
  expect(west).toBeLessThan(105)
  const [[nbS], [nbN, nbE]] = regionBounds(data, 'trung-du-mien-nui-phia-bac')!
  expect(nbE).toBeLessThan(109)
  expect(nbS).toBeGreaterThan(20)
  expect(nbN).toBeGreaterThan(23)
  expect(regionBounds(data, 'khong-co')).toBeNull()
})
