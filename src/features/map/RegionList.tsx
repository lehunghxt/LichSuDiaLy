import { Clock } from 'lucide-react'
import type { RegionMeta } from '../../types/content'

interface RegionListProps {
  regions: RegionMeta[]
  selectedId: string | null
  onSelect(id: string): void
}

// Tên ngắn cho chip trên bản đồ (tên đầy đủ ở tooltip, trình đọc màn hình và thẻ vùng ở khung bên)
const SHORT: Record<string, string> = {
  'trung-du-mien-nui-phia-bac': 'Trung du, miền núi',
  'dong-bang-bac-bo': 'Đồng bằng Bắc Bộ',
  'bac-trung-bo-va-nam-trung-bo': 'Trung Bộ',
  'nam-bo': 'Nam Bộ',
}

/** Dải chip các vùng nằm ngang ở mép trên bản đồ: vừa là chú giải màu, vừa để chọn vùng (cả bằng bàn phím).
 *  Luôn hiện; màn hẹp thì chip xuống hàng. */
export function RegionList({ regions, selectedId, onSelect }: RegionListProps) {
  return (
    <ul aria-label="Các vùng địa lí" className="flex max-w-full flex-wrap gap-1 rounded-2xl bg-surface/95 p-1.5 shadow-lg backdrop-blur ">
      {regions.map((r) => {
        const selected = r.id === selectedId
        return (
          <li key={r.id} className="shrink-0">
            <button
              type="button"
              aria-pressed={selected}
              aria-label={r.name}
              title={r.name}
              onClick={() => onSelect(r.id)}
              className={`flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-xl px-2 text-xs sm:min-h-9 sm:gap-2 sm:px-2.5 sm:text-sm transition-colors ${
                selected ? 'bg-violet-100 font-bold ring-2 ring-violet-300' : 'font-semibold hover:bg-bg'
              }`}
            >
              <span aria-hidden className="size-3.5 shrink-0 rounded" style={{ background: `var(--color-${r.color})` }} />
              {SHORT[r.id] ?? r.name}
              {r.status === 'coming_soon' && (
                <span title="Sắp ra mắt" className="text-muted">
                  <Clock aria-hidden className="size-3.5" />
                  <span className="sr-only">Sắp ra mắt</span>
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
