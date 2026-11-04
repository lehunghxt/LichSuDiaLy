// Chiếu ranh giới vùng (GeoJSON) thành path SVG, không cần Leaflet. Dùng cho bản đồ thu nhỏ ở trang chủ và câu hỏi bản đồ.
import type { AreaCollection, RegionFeatureProps } from './geo'

type Ring = number[][]

// Phép chiếu đơn giản (equirectangular), hệ số cos(16°) cho vĩ độ trung bình của Việt Nam
const K = Math.cos((16 * Math.PI) / 180)

export interface SvgAreas {
  viewBox: string
  paths: { regionId: string; d: string }[]
  /** Toạ độ SVG của một điểm (kinh độ, vĩ độ) trong cùng phép chiếu */
  project(lng: number, lat: number): [number, number]
}

/** Khung hình vừa với các vùng được chọn (mặc định: tất cả), cao 100 đơn vị */
export function projectAreas(data: AreaCollection<RegionFeatureProps>, regionIds?: string[]): SvgAreas {
  const features = regionIds ? data.features.filter((f) => regionIds.includes(f.properties.regionId)) : data.features
  const rings = (g: GeoJSON.Polygon | GeoJSON.MultiPolygon): Ring[] => (g.type === 'Polygon' ? g.coordinates : g.coordinates.flat())
  const all = features.flatMap((f) => rings(f.geometry).flat())
  const lngs = all.map((p) => p[0] ?? 0)
  const lats = all.map((p) => p[1] ?? 0)
  const minLng = Math.min(...lngs)
  const maxLat = Math.max(...lats)
  const width = (Math.max(...lngs) - minLng) * K
  const height = maxLat - Math.min(...lats)
  const scale = 100 / height
  const project = (lng: number, lat: number): [number, number] => [(lng - minLng) * K * scale, (maxLat - lat) * scale]
  const pt = (p: number[]) =>
    project(p[0] ?? 0, p[1] ?? 0)
      .map((n) => n.toFixed(2))
      .join(',')
  return {
    viewBox: `-2 -2 ${(width * scale + 4).toFixed(2)} 104`,
    paths: features.map((f) => ({
      regionId: f.properties.regionId,
      d: rings(f.geometry)
        .map((r) => `M${r.map(pt).join('L')}Z`)
        .join(''),
    })),
    project,
  }
}
