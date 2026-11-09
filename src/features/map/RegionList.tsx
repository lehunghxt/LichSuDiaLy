import { Clock } from 'lucide-react'
import { useEffect, useRef } from 'react'
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

/** Dải chip các vùng ở mép trên bản đồ: vừa là chú giải màu, vừa để chọn vùng (cả bằng bàn phím).
 *  Mỗi vùng một viên chip tròn, nằm trên một hàng; màn hẹp vuốt ngang. Chip đang chọn tô màu của vùng. */
export function RegionList({ regions, selectedId, onSelect }: RegionListProps) {
  const selectedRef = useRef<HTMLButtonElement>(null)
  // Đổi vùng: đưa chip đang chọn vào tầm nhìn (màn hẹp có thể đang bị cuộn khuất)
  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [selectedId])
  return (
    <ul
      aria-label="Các vùng địa lý"
      // py để bóng của chip không bị cắt khi cuộn ngang; mép phải mờ dần báo còn chip khuất (màn hẹp vuốt ngang)
      className="-my-2 flex max-w-full gap-2 overflow-x-auto py-2 pr-6 [mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {regions.map((r) => {
        const selected = r.id === selectedId
        return (
          <li key={r.id} className="shrink-0">
            <button
              ref={selected ? selectedRef : undefined}
              type="button"
              aria-pressed={selected}
              aria-label={r.name}
              title={r.name}
              onClick={() => onSelect(r.id)}
              style={selected ? { background: `var(--color-${r.color})` } : undefined}
              className={`flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm shadow-md transition ${
                selected ? 'font-bold text-ink shadow-lg' : 'bg-surface/95 font-semibold text-ink/80 backdrop-blur hover:bg-surface'
              }`}
            >
              <span
                aria-hidden
                className={`size-3 shrink-0 rounded-full ${selected ? 'bg-surface ring-2 ring-ink/20' : ''}`}
                style={selected ? undefined : { background: `var(--color-${r.color})` }}
              />
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
