import { ChevronRight, Compass } from 'lucide-react'
import { provinceNamesOfRegion } from '../../../lib/provinces'
import { type RegionMeta } from '../../../types/content'
import { card } from './styles'

/** Chưa chọn vùng: mỗi vùng một thẻ lớn (màu, tên, số tỉnh) để em bấm vào khám phá */
export function RegionCards({ regions, onSelect }: { regions: RegionMeta[]; onSelect(id: string): void }) {
  return (
    <section aria-labelledby="region-cards-title" className={`${card} flex flex-col gap-4`}>
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft">
          <Compass aria-hidden className="size-7 text-primary" />
        </span>
        <div>
          <h2 id="region-cards-title" className="text-xl font-bold leading-tight">
            Các vùng địa lí Việt Nam
          </h2>
          <p className="text-sm text-muted">Em bấm vào một vùng trên bản đồ hoặc chọn bên dưới để bắt đầu khám phá nhé!</p>
        </div>
      </div>
      <ul aria-label="Chọn vùng để khám phá" className="flex flex-col gap-2.5">
        {regions.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect(r.id)}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-transparent bg-bg p-3 text-left transition hover:border-primary/30 hover:bg-primary-soft"
            >
              <span aria-hidden className="h-12 w-2.5 shrink-0 rounded-full" style={{ background: `var(--color-${r.color})` }} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold leading-snug">{r.name}</span>
                <span className="text-sm text-muted">
                  {provinceNamesOfRegion(r.id).length} tỉnh, thành phố
                  {r.status === 'coming_soon' && ' · Sắp ra mắt'}
                </span>
              </span>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-muted" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
