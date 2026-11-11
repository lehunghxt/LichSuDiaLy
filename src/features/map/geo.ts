// Tải dữ liệu bản đồ tĩnh trong public/maps và kiểm tra cấu trúc trước khi dùng.
import type { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from 'geojson'

export interface RegionFeatureProps {
  regionId: string
}
export interface ProvinceFeatureProps {
  provinceId: string
  name: string
  regionId: string
}
export interface NeighborFeatureProps {
  kind: 'foreign'
}
export interface LabelFeatureProps {
  name: string
  kind: 'archipelago' | 'sea' | 'country'
}

export type AreaCollection<P> = FeatureCollection<Polygon | MultiPolygon, P>
export type LabelCollection = FeatureCollection<Point, LabelFeatureProps>

export type GeoResult<T> = { ok: true; data: T } | { ok: false; reason: 'network' | 'invalid' }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

function isCollectionOf<F extends Feature>(raw: unknown, isFeature: (f: unknown) => f is F): raw is FeatureCollection & { features: F[] } {
  return isObj(raw) && raw.type === 'FeatureCollection' && Array.isArray(raw.features) && raw.features.every(isFeature)
}

const isArea = (g: unknown) => isObj(g) && (g.type === 'Polygon' || g.type === 'MultiPolygon') && Array.isArray(g.coordinates)
const str = (o: Record<string, unknown>, k: string) => typeof o[k] === 'string' && o[k] !== ''

function isRegionFeature(f: unknown): f is Feature<Polygon | MultiPolygon, RegionFeatureProps> {
  return isObj(f) && isArea(f.geometry) && isObj(f.properties) && str(f.properties, 'regionId')
}

function isProvinceFeature(f: unknown): f is Feature<Polygon | MultiPolygon, ProvinceFeatureProps> {
  return (
    isObj(f) &&
    isArea(f.geometry) &&
    isObj(f.properties) &&
    str(f.properties, 'provinceId') &&
    str(f.properties, 'name') &&
    str(f.properties, 'regionId')
  )
}

function isLabelFeature(f: unknown): f is Feature<Point, LabelFeatureProps> {
  return (
    isObj(f) &&
    isObj(f.geometry) &&
    f.geometry.type === 'Point' &&
    isObj(f.properties) &&
    str(f.properties, 'name') &&
    (f.properties.kind === 'archipelago' || f.properties.kind === 'sea' || f.properties.kind === 'country')
  )
}

function isNeighborFeature(f: unknown): f is Feature<Polygon | MultiPolygon, NeighborFeatureProps> {
  return isObj(f) && isArea(f.geometry) && isObj(f.properties) && f.properties.kind === 'foreign'
}

export const isRegionCollection = (raw: unknown): raw is AreaCollection<RegionFeatureProps> => isCollectionOf(raw, isRegionFeature)
export const isProvinceCollection = (raw: unknown): raw is AreaCollection<ProvinceFeatureProps> => isCollectionOf(raw, isProvinceFeature)
export const isLabelCollection = (raw: unknown): raw is LabelCollection => isCollectionOf(raw, isLabelFeature)
export const isNeighborCollection = (raw: unknown): raw is AreaCollection<NeighborFeatureProps> =>
  isCollectionOf(raw, isNeighborFeature)

type Fetcher = (url: string) => Promise<Response>

export function createGeoLoader(fetcher: Fetcher, base = '/') {
  const cache = new Map<string, unknown>()

  async function load<T>(file: string, guard: (raw: unknown) => raw is T): Promise<GeoResult<T>> {
    const cached = cache.get(file)
    if (cached !== undefined && guard(cached)) return { ok: true, data: cached }
    let raw: unknown
    try {
      const res = await fetcher(`${base}maps/${file}`)
      if (!res.ok) return { ok: false, reason: 'network' }
      raw = await res.json()
    } catch (e) {
      return { ok: false, reason: e instanceof SyntaxError ? 'invalid' : 'network' }
    }
    if (!guard(raw)) return { ok: false, reason: 'invalid' }
    cache.set(file, raw)
    return { ok: true, data: raw }
  }

  return {
    loadRegions: () => load('regions.geojson', isRegionCollection),
    loadProvinces: () => load('provinces.geojson', isProvinceCollection),
    loadLabels: () => load('labels.geojson', isLabelCollection),
    /** Đất nước ngoài (tô xám làm nền) */
    loadNeighbors: () => load('neighbors.geojson', isNeighborCollection),
  }
}

export const geoLoader = createGeoLoader((url) => fetch(url), import.meta.env.BASE_URL)

export type WithOffshore<P> = P & { offshore: boolean }

// Bờ đông xa nhất của đất liền là Mũi Đôi (Khánh Hòa, ~109,46°E). Phần nằm hẳn phía đông 109,6°E,
// hoặc phía đông 109°E mà phía nam 10°N (các bãi rìa tây nam Trường Sa), thuộc quần đảo xa bờ.
const isOffshorePart = (poly: Polygon['coordinates']) => {
  const ring = poly[0] ?? []
  const minLng = Math.min(...ring.map((c) => c[0] ?? 0))
  const maxLat = Math.max(...ring.map((c) => c[1] ?? 0))
  return minLng > 109.6 || (minLng > 109 && maxLat < 10)
}

/**
 * Tách Hoàng Sa, Trường Sa ra feature riêng (offshore: true) để vẽ không viền: dữ liệu gốc vẽ cả bãi đá, rạn san hô
 * thành nhiều mảnh nhỏ, thêm viền thì các mảnh bị phình to so với thực tế.
 */
export function splitOffshore<P>(data: AreaCollection<P>): AreaCollection<WithOffshore<P>> {
  const features = data.features.flatMap((f) => {
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]
    const offshore = polys.filter(isOffshorePart)
    const mainland = polys.filter((p) => !isOffshorePart(p))
    const part = (coordinates: Polygon['coordinates'][], isOff: boolean): Feature<MultiPolygon, WithOffshore<P>> => ({
      type: 'Feature',
      properties: { ...f.properties, offshore: isOff },
      geometry: { type: 'MultiPolygon', coordinates },
    })
    return [...(mainland.length ? [part(mainland, false)] : []), ...(offshore.length ? [part(offshore, true)] : [])]
  })
  return { ...data, features }
}

/** Khung bao toàn bộ một vùng [[nam, tây], [bắc, đông]], tính cả quần đảo xa bờ (Hoàng Sa, Trường Sa) */
export function regionBounds(data: AreaCollection<RegionFeatureProps>, regionId: string): [[number, number], [number, number]] | null {
  let s = Infinity
  let w = Infinity
  let n = -Infinity
  let e = -Infinity
  for (const f of data.features) {
    if (f.properties.regionId !== regionId) continue
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
    for (const [lng, lat] of polys.flat(2) as [number, number][]) {
      s = Math.min(s, lat)
      n = Math.max(n, lat)
      w = Math.min(w, lng)
      e = Math.max(e, lng)
    }
  }
  return Number.isFinite(s)
    ? [
        [s, w],
        [n, e],
      ]
    : null
}
