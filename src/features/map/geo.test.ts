import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createGeoLoader, isProvinceCollection, isRegionCollection } from './geo'

const mapsDir = path.resolve(import.meta.dirname, '../../../public/maps')
const readJson = (f: string): unknown => JSON.parse(readFileSync(path.join(mapsDir, f), 'utf8'))

const regionFc = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: { regionId: 'vung-a' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] } }],
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
