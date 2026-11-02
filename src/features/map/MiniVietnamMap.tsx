// Bản đồ Việt Nam thu nhỏ dạng SVG cho trang chủ: không cần Leaflet, chỉ vẽ 4 vùng từ regions.geojson.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { RegionMeta } from '../../types/content'
import { geoLoader, type AreaCollection, type RegionFeatureProps } from './geo'

type Ring = number[][]

// Phép chiếu đơn giản (equirectangular), hệ số cos(16°) cho vĩ độ trung bình của Việt Nam
const K = Math.cos((16 * Math.PI) / 180)

function toPaths(data: AreaCollection<RegionFeatureProps>) {
  const rings = (g: GeoJSON.Polygon | GeoJSON.MultiPolygon): Ring[] =>
    g.type === 'Polygon' ? g.coordinates : g.coordinates.flat()
  const all = data.features.flatMap((f) => rings(f.geometry).flat())
  const lngs = all.map((p) => p[0] ?? 0)
  const lats = all.map((p) => p[1] ?? 0)
  const minLng = Math.min(...lngs)
  const maxLat = Math.max(...lats)
  const width = (Math.max(...lngs) - minLng) * K
  const height = maxLat - Math.min(...lats)
  const scale = 100 / height
  const pt = (p: number[]) => `${(((p[0] ?? 0) - minLng) * K * scale).toFixed(2)},${((maxLat - (p[1] ?? 0)) * scale).toFixed(2)}`
  return {
    viewBox: `-2 -2 ${(width * scale + 4).toFixed(2)} 104`,
    paths: data.features.map((f) => ({
      regionId: f.properties.regionId,
      d: rings(f.geometry)
        .map((r) => `M${r.map(pt).join('L')}Z`)
        .join(''),
    })),
  }
}

export function MiniVietnamMap({ regions, className = '' }: { regions: RegionMeta[]; className?: string }) {
  const navigate = useNavigate()
  const [data, setData] = useState<AreaCollection<RegionFeatureProps> | null>(null)
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    geoLoader.loadRegions().then((r) => {
      if (!cancelled && r.ok) setData(r.data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const shape = useMemo(() => (data ? toPaths(data) : null), [data])
  if (!shape) return <div aria-hidden className={className} />

  const meta = (id: string) => regions.find((r) => r.id === id)
  // Trang trí + lối tắt bằng chuột; các liên kết chính tới từng vùng nằm ở mục "Bốn vùng đất"
  return (
    <svg aria-hidden viewBox={shape.viewBox} className={className}>
      {shape.paths.map(({ regionId, d }) => {
        const m = meta(regionId)
        return (
          <path
            key={regionId}
            d={d}
            fill={`var(--color-${m?.color ?? 'line'})`}
            stroke="#fff"
            strokeWidth={hover === regionId ? 0.9 : 0.35}
            strokeLinejoin="round"
            className="cursor-pointer transition-[stroke-width,filter] duration-200 hover:brightness-105"
            onMouseEnter={() => setHover(regionId)}
            onMouseLeave={() => setHover(null)}
            onClick={() => navigate(`/ban-do/${regionId}`)}
          >
            <title>{m?.name}</title>
          </path>
        )
      })}
    </svg>
  )
}
