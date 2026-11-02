import { MapPin } from 'lucide-react'
import type { RegionMeta } from '../../types/content'

interface RegionListProps {
  regions: RegionMeta[]
  selectedId: string | null
  onSelect(id: string): void
}

/** Danh sách vùng dạng nút: cách chọn vùng bằng bàn phím, song song với bấm trên bản đồ */
export function RegionList({ regions, selectedId, onSelect }: RegionListProps) {
  return (
    <ul aria-label="Các vùng địa lí" className="grid gap-2 sm:grid-cols-2">
      {regions.map((r) => {
        const selected = r.id === selectedId
        return (
          <li key={r.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(r.id)}
              className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border-2 px-4 py-2 text-left font-semibold transition-colors ${
                selected ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:border-primary'
              }`}
            >
              <span aria-hidden className="size-4 shrink-0 rounded-full" style={{ background: `var(--color-${r.color})` }} />
              <span className="flex-1">{r.name}</span>
              {r.status === 'coming_soon' ? (
                <span className="rounded-full bg-line px-2 py-0.5 text-xs font-semibold text-muted">Sắp ra mắt</span>
              ) : (
                <MapPin aria-hidden className="size-5 text-primary" />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
