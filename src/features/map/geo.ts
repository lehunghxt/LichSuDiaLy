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
export interface LabelFeatureProps {
  name: string
  kind: 'archipelago' | 'sea'
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
    (f.properties.kind === 'archipelago' || f.properties.kind === 'sea')
  )
}

export const isRegionCollection = (raw: unknown): raw is AreaCollection<RegionFeatureProps> =>
  isCollectionOf(raw, isRegionFeature)
export const isProvinceCollection = (raw: unknown): raw is AreaCollection<ProvinceFeatureProps> =>
  isCollectionOf(raw, isProvinceFeature)
export const isLabelCollection = (raw: unknown): raw is LabelCollection => isCollectionOf(raw, isLabelFeature)

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
  }
}

export const geoLoader = createGeoLoader((url) => fetch(url), import.meta.env.BASE_URL)
