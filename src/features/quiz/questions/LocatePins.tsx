// Bản đồ SVG của một vùng với các điểm ứng viên đánh chữ A, B, C (không ghi tên địa danh)
import { useMemo } from 'react'
import { type AreaCollection, projectAreas, type RegionFeatureProps } from '../../map'

export interface Pin {
  id: string
  label: string
  lat: number
  lng: number
}

interface LocatePinsProps {
  regions: AreaCollection<RegionFeatureProps>
  regionId: string
  pins: Pin[]
  onPick(id: string): void
  chosenId?: string
  /** Sau khi trả lời: điểm đúng */
  correctId?: string
  locked?: boolean
}

export function LocatePins({ regions, regionId, pins, onPick, chosenId, correctId, locked = false }: LocatePinsProps) {
  const shape = useMemo(() => projectAreas(regions, [regionId]), [regions, regionId])
  const fill = (id: string) =>
    locked && id === correctId ? 'var(--color-secondary)' : id === chosenId ? 'var(--color-accent)' : 'var(--color-primary)'

  // Chuột và màn hình cảm ứng chạm vào điểm; bàn phím và trình đọc màn hình dùng danh sách nút bên dưới
  return (
    <svg aria-hidden viewBox={shape.viewBox} className="mx-auto h-auto max-h-[60vh] w-full max-w-xl overflow-visible">
      {shape.paths.map((p) => (
        <path
          key={p.regionId}
          d={p.d}
          fill="var(--color-primary-soft)"
          stroke="var(--color-primary)"
          strokeWidth={0.4}
          strokeLinejoin="round"
        />
      ))}
      {pins.map((pin) => {
        const [x, y] = shape.project(pin.lng, pin.lat)
        return (
          <g
            key={pin.id}
            data-pin={pin.label}
            data-y={y.toFixed(2)}
            onClick={() => !locked && onPick(pin.id)}
            className={locked ? undefined : 'cursor-pointer'}
          >
            <circle cx={x} cy={y} r={5.5} fill={fill(pin.id)} stroke="#fff" strokeWidth={1.1} />
            <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize={6} fontWeight={700} fill="#fff">
              {pin.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
