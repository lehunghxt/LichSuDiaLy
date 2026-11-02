import { ArrowLeft, Clock, Compass } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { TOPIC_CATEGORIES, TOPIC_LABELS, type RegionMeta, type TopicCategory } from '../../types/content'
import { itemSlug } from '../content/links'
import { getItemsByCategory } from '../content/repository'
import { TOPIC_ICONS } from '../content/topicIcons'
import type { RegionContentState } from '../content/useRegionContent'
import provinces from '../../data/provinces.json'

interface MapInfoPanelProps {
  region: RegionMeta | null
  regionIdFromUrl: string | undefined
  content: RegionContentState & { retry(): void }
  provinceId: string | null
  onBack(): void
  /** Mở modal chủ đề ngay trên trang bản đồ; slug null = mục đầu tiên */
  onOpen(category: TopicCategory, slug: string | null): void
}

export function MapInfoPanel({ region, regionIdFromUrl, content, provinceId, onBack, onOpen }: MapInfoPanelProps) {
  if (!regionIdFromUrl) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-8 text-center shadow-sm">
        <Compass aria-hidden className="size-14 text-accent" />
        <p className="text-lg font-semibold">Em hãy chọn một vùng trên bản đồ để bắt đầu khám phá nhé!</p>
        <p className="text-muted">Em có thể bấm trực tiếp lên bản đồ hoặc chọn trong danh sách vùng.</p>
      </div>
    )
  }

  const back = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 font-semibold hover:bg-primary-soft"
    >
      <ArrowLeft aria-hidden className="size-5" />
      Về bản đồ Việt Nam
    </button>
  )

  if (!region) {
    return <EmptyState title="Không tìm thấy vùng này" description="Em hãy chọn một vùng khác trong danh sách nhé." action={back} />
  }

  return (
    <section aria-label={region.name} className="flex flex-col gap-5 rounded-card bg-surface p-6 shadow-sm">
      <div>{back}</div>
      <h2 className="text-2xl font-bold" style={{ color: `var(--color-${region.color})` }}>
        {region.name}
      </h2>

      {region.status === 'coming_soon' && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent-soft p-4">
          <Clock aria-hidden className="size-6 shrink-0 text-accent" />
          <p>Nội dung vùng {region.name} đang được chuẩn bị.</p>
        </div>
      )}

      {region.status === 'active' && content.status === 'loading' && <LoadingState label="Đang tải nội dung vùng…" />}
      {region.status === 'active' && content.status === 'error' && (
        <ErrorState title="Chưa tải được nội dung vùng" onRetry={content.retry} />
      )}
      {region.status === 'active' && content.status === 'ready' && (
        <>
          <p>{content.content.intro}</p>
          <div>
            <h3 className="mb-3 font-bold">Chủ đề khám phá</h3>
            <ul className="grid gap-2">
              {TOPIC_CATEGORIES.map((cat) => {
                const Icon = TOPIC_ICONS[cat]
                const count = getItemsByCategory(content.content, cat).length
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => onOpen(cat, null)}
                      className="flex min-h-12 w-full items-center gap-3 rounded-2xl border-2 border-line px-4 py-2 text-left font-semibold transition-colors hover:border-primary hover:bg-primary-soft"
                    >
                      <Icon aria-hidden className="size-6 text-primary" />
                      <span className="flex-1">{TOPIC_LABELS[cat]}</span>
                      <span className="text-sm text-muted">{count} mục</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
          {provinceId && <ProvinceItems content={content.content} provinceId={provinceId} onOpen={onOpen} />}
        </>
      )}
    </section>
  )
}

interface ProvinceItemsProps {
  content: { items: { id: string; title: string; category: TopicCategory; provinceId?: string }[] }
  provinceId: string
  onOpen(category: TopicCategory, slug: string): void
}

function ProvinceItems({ content, provinceId, onOpen }: ProvinceItemsProps) {
  const name = provinces.find((p) => p.id === provinceId)?.name ?? provinceId
  const items = content.items.filter((i) => i.provinceId === provinceId)
  return (
    <div className="rounded-2xl bg-bg p-4">
      <h3 className="font-bold">Tỉnh {name}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-muted">Chưa có địa danh nào của tỉnh này. Em xem các chủ đề ở trên nhé!</p>
      ) : (
        <ul aria-label={`Địa danh ở tỉnh ${name}`} className="mt-2 flex flex-wrap gap-2">
          {items.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => onOpen(i.category, itemSlug(i.id))}
                className="inline-flex min-h-11 items-center rounded-full bg-secondary-soft px-4 font-semibold text-secondary hover:brightness-95"
              >
                {i.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
