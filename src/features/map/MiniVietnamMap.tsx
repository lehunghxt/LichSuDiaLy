// Bản đồ Việt Nam thu nhỏ dạng SVG cho trang chủ: không cần Leaflet, chỉ vẽ 4 vùng từ regions.geojson.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import type { RegionMeta } from '../../types/content'
import { geoLoader, type AreaCollection, type RegionFeatureProps } from './geo'
import { projectAreas } from './svgMap'

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
