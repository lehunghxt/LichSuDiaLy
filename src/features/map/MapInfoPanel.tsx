import { ArrowLeft, BookOpen, ChevronRight, Clock, Compass, MapPin, Mountain } from 'lucide-react'
import { SmartImage } from '../../components/ui/SmartImage'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import provinces from '../../data/provinces.json'
import { TOPIC_CATEGORIES, TOPIC_LABELS, type ContentItem, type RegionContent, type RegionMeta, type TopicCategory } from '../../types/content'
import { itemSlug } from '../content/links'
import { getItemsByCategory } from '../content/repository'
import { TOPIC_ICONS, TOPIC_TILE } from '../content/topicIcons'
import type { RegionContentState } from '../content/useRegionContent'

interface MapInfoPanelProps {
  region: RegionMeta | null
  regionIdFromUrl: string | undefined
  content: RegionContentState & { retry(): void }
  provinceId: string | null
  onBack(): void
  /** Mở modal chủ đề ngay trên trang bản đồ; slug null = mục đầu tiên */
  onOpen(category: TopicCategory, slug: string | null): void
}

const provinceName = (id: string | undefined) => provinces.find((p) => p.id === id)?.name

/** Địa điểm tiêu biểu: ưu tiên danh lam, di tích gắn với một tỉnh cụ thể; tối đa 3 */
function featuredPlaces(content: RegionContent): ContentItem[] {
  const order: TopicCategory[] = ['landmark', 'historical_site', 'culture', 'natural', 'mineral']
  return order.flatMap((c) => getItemsByCategory(content, c).filter((i) => i.provinceId)).slice(0, 3)
}

const card = 'rounded-card bg-surface p-6 shadow-[0_8px_30px_rgb(15_23_42/0.08)]'

export function MapInfoPanel({ region, regionIdFromUrl, content, provinceId, onBack, onOpen }: MapInfoPanelProps) {
  if (!regionIdFromUrl) {
    return (
      <div className={`${card} flex flex-col items-center gap-4 py-12 text-center`}>
        <span className="flex size-20 items-center justify-center rounded-full bg-primary-soft">
          <Compass aria-hidden className="size-11 text-primary" />
        </span>
        <p className="text-xl font-bold">Em hãy chọn một vùng trên bản đồ để bắt đầu khám phá nhé!</p>
        <p className="max-w-sm text-muted">Em có thể bấm trực tiếp lên bản đồ hoặc chọn trong bảng các vùng địa lí.</p>
      </div>
    )
  }

  const back = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:bg-bg hover:text-ink"
    >
      <ArrowLeft aria-hidden className="size-4" />
      Về bản đồ Việt Nam
    </button>
  )

  if (!region) {
    return <EmptyState title="Không tìm thấy vùng này" description="Em hãy chọn một vùng khác trong danh sách nhé." action={back} />
  }

  const ready = region.status === 'active' && content.status === 'ready' ? content.content : null
  const cover = ready?.items.find((i) => i.images.length > 0)?.images[0]

  return (
    <section aria-label={region.name} className={`${card} flex flex-col gap-6`}>
      <div className="-mb-4 -mt-2 flex justify-end">{back}</div>

      <header className="flex gap-5">
        <div className="w-36 shrink-0">
          {cover ? (
            <SmartImage image={cover} sizes="144px" priority className="aspect-square" />
          ) : (
            <div
              aria-hidden
              className="flex aspect-square items-center justify-center rounded-card"
              style={{ background: `linear-gradient(135deg, var(--color-${region.color}), #bbf7d0)` }}
            >
              <Mountain className="size-14 text-white drop-shadow" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h2 className="flex items-center gap-2 text-2xl font-bold xl:text-3xl">
            <Mountain aria-hidden className="size-8 shrink-0 text-secondary" />
            {region.name}
          </h2>
          {ready && <p className="text-muted">{ready.intro}</p>}
        </div>
      </header>

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

      {ready && (
        <>
          <div className="border-t border-line pt-5">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <BookOpen aria-hidden className="size-6 text-primary" />
              Khám phá theo chủ đề
            </h3>
            <ul className="grid grid-cols-5 gap-3">
              {TOPIC_CATEGORIES.map((cat) => {
                const Icon = TOPIC_ICONS[cat]
                const style = TOPIC_TILE[cat]
                const count = getItemsByCategory(ready, cat).length
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => onOpen(cat, null)}
                      className={`flex h-full w-full flex-col items-center gap-2 rounded-2xl border-2 px-2 py-4 text-center text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.tile}`}
                    >
                      <Icon aria-hidden className={`size-10 ${style.icon}`} strokeWidth={1.75} />
                      <span className="leading-snug">{TOPIC_LABELS[cat]}</span>
                      <span className="text-xs font-semibold text-muted">{count} mục</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {provinceId && <ProvinceItems content={ready} provinceId={provinceId} onOpen={onOpen} />}

          <FeaturedPlaces items={featuredPlaces(ready)} onOpen={onOpen} />

          <button
            type="button"
            onClick={() => onOpen('natural', null)}
            className="mx-auto inline-flex min-h-14 items-center gap-3 rounded-full bg-primary-dark px-8 text-lg font-bold text-white shadow-lg transition hover:bg-primary"
          >
            <BookOpen aria-hidden className="size-6" />
            Khám phá chi tiết vùng này
            <ChevronRight aria-hidden className="size-6" />
          </button>
        </>
      )}
    </section>
  )
}

function FeaturedPlaces({ items, onOpen }: { items: ContentItem[]; onOpen(category: TopicCategory, slug: string): void }) {
  if (items.length === 0) return null
  return (
    <div className="border-t border-line pt-5">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <MapPin aria-hidden className="size-6 text-primary" />
        Một số địa điểm tiêu biểu
      </h3>
      <ul aria-label="Một số địa điểm tiêu biểu" className="grid grid-cols-3 gap-3">
        {items.map((i) => {
          const Icon = TOPIC_ICONS[i.category]
          const image = i.images[0]
          return (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => onOpen(i.category, itemSlug(i.id))}
                className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {image ? (
                  <SmartImage image={image} sizes="200px" className="aspect-[4/3] rounded-none" />
                ) : (
                  <span aria-hidden className={`flex aspect-[4/3] items-center justify-center ${TOPIC_TILE[i.category].tile}`}>
                    <Icon className={`size-10 ${TOPIC_TILE[i.category].icon}`} strokeWidth={1.75} />
                  </span>
                )}
                <span className="flex gap-1.5 p-3">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-rose-500" />
                  <span className="text-sm leading-snug">
                    <span className="block font-bold">{i.title}</span>
                    <span className="text-muted">({provinceName(i.provinceId)})</span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface ProvinceItemsProps {
  content: RegionContent
  provinceId: string
  onOpen(category: TopicCategory, slug: string): void
}

function ProvinceItems({ content, provinceId, onOpen }: ProvinceItemsProps) {
  const name = provinceName(provinceId) ?? provinceId
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
