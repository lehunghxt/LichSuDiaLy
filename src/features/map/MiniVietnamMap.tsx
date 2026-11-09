// Bản đồ Việt Nam thu nhỏ dạng SVG cho trang chủ: không cần Leaflet, chỉ vẽ 4 vùng từ regions.geojson.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { RegionMeta } from '../../types/content'
import { geoLoader, type AreaCollection, type RegionFeatureProps } from './geo'
import { projectAreas } from './svgMap'

// Nhãn hai quần đảo: Hoàng Sa ghi ngay dưới, Trường Sa ghi phía trên quần đảo (toạ độ gần đúng, chỉ để hiển thị)
const ARCHIPELAGOS = [
  { name: 'QĐ. Hoàng Sa', lng: 112.1, lat: 15.1 },
  { name: 'QĐ. Trường Sa', lng: 114.5, lat: 12.2 },
]

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

  const shape = useMemo(() => (data ? projectAreas(data) : null), [data])
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
            // Vẽ viền dưới phần tô: các đảo nhỏ của Hoàng Sa, Trường Sa giữ được màu vùng thay vì chỉ còn viền trắng
            paintOrder="stroke"
            className="cursor-pointer transition-[stroke-width,filter] duration-200 hover:brightness-105"
            onMouseEnter={() => setHover(regionId)}
            onMouseLeave={() => setHover(null)}
            onClick={() => navigate(`/ban-do/${regionId}`)}
          >
            <title>{m?.name}</title>
          </path>
        )
      })}
      {ARCHIPELAGOS.map(({ name, lng, lat }) => {
        const [x, y] = shape.project(lng, lat)
        return (
          <text key={name} x={x} y={y} textAnchor="middle" className="pointer-events-none fill-[#334155] text-[2.6px] font-semibold">
            {name}
          </text>
        )
      })}
    </svg>
  )
}
