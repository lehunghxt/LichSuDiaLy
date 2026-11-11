import { archipelagoViolations, borderGaps, isArchipelagoPart, splitCountries } from '../../../../scripts/lib/neighbors.mjs'

const sq = (lng, lat, d = 0.1) => [
  [
    [lng, lat],
    [lng + d, lat],
    [lng + d, lat + d],
    [lng, lat + d],
    [lng, lat],
  ],
]
const country = (id, polygons) => ({ type: 'Feature', properties: { ADM0_A3: id }, geometry: { type: 'MultiPolygon', coordinates: polygons } })
const area = (polygons, properties = {}) => ({ type: 'Feature', properties, geometry: { type: 'MultiPolygon', coordinates: polygons } })

test('small islands inside Hoàng Sa or Trường Sa count as archipelago parts; big islands reaching into the zone (Borneo) do not', () => {
  expect(isArchipelagoPart(sq(112, 16.5))).toBe(true) // Hoàng Sa
  expect(isArchipelagoPart(sq(114, 10))).toBe(true) // Trường Sa
  expect(isArchipelagoPart(sq(116.5, 6, 2))).toBe(false) // mũi bắc Borneo: lớn, lấn vào khung Trường Sa
  expect(isArchipelagoPart(sq(109, 19))).toBe(false) // Hải Nam
})

test('splitCountries drops archipelago islands, the Spratly and Scarborough entries, and separates Natural Earth Vietnam', () => {
  const { foreign, vietnam } = splitCountries([
    country('CHN', [sq(110, 22, 3), sq(112, 16.5)]),
    country('MYS', [sq(114, 10)]),
    country('PGA', [sq(114.5, 10)]),
    country('SCR', [sq(117.7, 15.1)]),
    country('VNM', [sq(105, 15, 2)]),
    country('LAO', [sq(103, 18, 2)]),
  ])
  expect(foreign.map((f) => [f.properties.id, f.geometry.coordinates.length])).toEqual([
    ['CHN', 1],
    ['LAO', 1],
  ])
  expect(vietnam.map((f) => f.properties.id)).toEqual(['VNM'])
})

test('borderGaps keeps gaps touching China, Laos or Cambodia and drops coastal slivers', () => {
  const laos = { type: 'Feature', properties: { id: 'LAO' }, geometry: { type: 'MultiPolygon', coordinates: [sq(103, 18, 1)] } }
  const thai = { type: 'Feature', properties: { id: 'THA' }, geometry: { type: 'MultiPolygon', coordinates: [sq(100, 15, 1)] } }
  const atBorder = area([sq(104, 19, 0.1)]) // chung đỉnh (104, 19) với Lào
  const coastal = area([sq(108, 12, 0.05)])
  const nearThailand = area([sq(101, 15, 0.1)]) // chung đỉnh với Thái Lan, không phải nước giáp Việt Nam
  expect(borderGaps([atBorder, coastal, nearThailand], [laos, thai])).toEqual([atBorder])
})

test('archipelagoViolations names the zones where the built layer still has islands', () => {
  const fc = (polygons) => ({ type: 'FeatureCollection', features: [area(polygons, { kind: 'foreign' })] })
  expect(archipelagoViolations(fc([sq(110, 22, 3), sq(116.5, 6, 2)]))).toEqual([])
  expect(archipelagoViolations(fc([sq(110, 22, 3), sq(112, 16.5), sq(114, 10), sq(113, 9)]))).toEqual(['Hoàng Sa', 'Trường Sa'])
})
