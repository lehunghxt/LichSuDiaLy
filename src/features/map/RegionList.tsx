import { ChevronDown, ChevronUp, Clock, Info, Layers } from 'lucide-react'
import { useState } from 'react'
import type { RegionMeta } from '../../types/content'

interface RegionListProps {
  regions: RegionMeta[]
  selectedId: string | null
  onSelect(id: string): void
}

// Màn nhỏ hơn 2xl (1536px): bản đồ hẹp, mặc định thu gọn để bảng không che bản đồ
const startOpen = () => typeof window.matchMedia !== 'function' || window.matchMedia('(min-width: 1536px)').matches

/** Bảng chú giải các vùng, đặt nổi trên bản đồ; đồng thời là cách chọn vùng bằng bàn phím */
export function RegionList({ regions, selectedId, onSelect }: RegionListProps) {
  const [open, setOpen] = useState(startOpen)

  if (!open) {
    return (
      <button
        type="button"
        aria-expanded={false}
        aria-label="Mở bảng các vùng"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl bg-surface/95 px-3 py-2 text-sm font-bold shadow-lg backdrop-blur hover:bg-surface"
      >
        <Layers aria-hidden className="size-4 text-primary" />
        Các vùng
        <span aria-hidden className="flex gap-1">
          {regions.map((r) => (
            <span
              key={r.id}
              className={`size-3 rounded-sm ${r.id === selectedId ? 'ring-2 ring-ink ring-offset-1' : ''}`}
              style={{ background: `var(--color-${r.color})` }}
            />
          ))}
        </span>
        <ChevronDown aria-hidden className="size-4 text-muted" />
      </button>
    )
  }

  return (
    <div className="flex w-56 flex-col gap-2 2xl:w-60">
      <div className="rounded-2xl bg-surface/95 p-2 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-0.5">
          <h2 className="text-base font-bold leading-snug">Các vùng địa lí Việt Nam</h2>
          <button
            type="button"
            aria-expanded={true}
            aria-label="Thu gọn bảng các vùng"
            onClick={() => setOpen(false)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-bg hover:text-ink"
          >
            <ChevronUp aria-hidden className="size-4" />
          </button>
        </div>
        <ul aria-label="Các vùng địa lí" className="flex flex-col gap-0.5">
          {regions.map((r) => {
            const selected = r.id === selectedId
            return (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(r.id)}
                  className={`flex min-h-9 w-full items-center gap-2.5 rounded-xl px-2.5 py-1 text-left text-sm transition-colors ${
                    selected ? 'bg-violet-100 font-bold' : 'font-semibold hover:bg-bg'
                  }`}
                >
                  <span aria-hidden className="size-4 shrink-0 rounded" style={{ background: `var(--color-${r.color})` }} />
                  <span className="flex-1 leading-snug">{r.name}</span>
                  {r.status === 'coming_soon' && (
                    <span title="Sắp ra mắt" className="shrink-0 text-muted">
                      <Clock aria-hidden className="size-3.5" />
                      <span className="sr-only">Sắp ra mắt</span>
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      {selectedId === null && (
        <p className="flex gap-2 rounded-2xl bg-surface/95 p-3 text-xs text-muted shadow-lg backdrop-blur">
          <Info aria-hidden className="size-5 shrink-0 text-primary" />
          Nhấn vào một vùng trên bản đồ để khám phá thông tin chi tiết.
        </p>
      )}
    </div>
  )
}
