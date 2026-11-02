import { Clock, Info } from 'lucide-react'
import type { RegionMeta } from '../../types/content'

interface RegionListProps {
  regions: RegionMeta[]
  selectedId: string | null
  onSelect(id: string): void
}

/** Bảng chú giải các vùng, đặt nổi trên bản đồ; đồng thời là cách chọn vùng bằng bàn phím */
export function RegionList({ regions, selectedId, onSelect }: RegionListProps) {
  return (
    <div className="flex w-64 flex-col gap-3">
      <div className="rounded-2xl bg-surface/95 p-3 shadow-lg backdrop-blur">
        <h2 className="px-2 pb-2 pt-1 text-lg font-bold">Các vùng địa lí Việt Nam</h2>
        <ul aria-label="Các vùng địa lí" className="flex flex-col gap-1">
          {regions.map((r) => {
            const selected = r.id === selectedId
            return (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(r.id)}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left text-sm transition-colors ${
                    selected ? 'bg-violet-100 font-bold' : 'font-semibold hover:bg-bg'
                  }`}
                >
                  <span aria-hidden className="size-5 shrink-0 rounded-md" style={{ background: `var(--color-${r.color})` }} />
                  <span className="flex-1 leading-snug">{r.name}</span>
                  {r.status === 'coming_soon' && (
                    <span title="Sắp ra mắt" className="shrink-0 text-muted">
                      <Clock aria-hidden className="size-4" />
                      <span className="sr-only">Sắp ra mắt</span>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <p className="flex gap-3 rounded-2xl bg-surface/95 p-4 text-sm text-muted shadow-lg backdrop-blur">
        <Info aria-hidden className="size-6 shrink-0 text-primary" />
        Nhấn vào một vùng trên bản đồ để khám phá thông tin chi tiết.
      </p>
    </div>
  )
}
