import { ArrowLeft, BookOpen, ChevronRight, Clock, MapPin, Mountain } from 'lucide-react'
import { useState } from 'react'
import { provinceName } from '../../../lib/provinces'
import { SmartImage } from '../../../components/ui/SmartImage'
import { WebImageFigure } from '../../../components/ui/WebImageFigure'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import {
  type ContentItem,
  type RegionContent,
  type RegionMeta,
  type RegionOutline,
  type SectionId,
  type WebImage,
} from '../../../types/content'
import { getItemsBySection, type RegionContentState } from '../../content'
import { imageLibrary } from '../../images'
import { card } from './styles'
import { FeaturedPlaces } from './FeaturedPlaces'
import { RegionCards } from './RegionCards'
import { ProvinceCard } from './ProvinceCard'
import { OutlineSections } from './OutlineSections'
import { RegionGallery } from './RegionGallery'

export interface MapInfoPanelProps {
  region: RegionMeta | null
  regions: RegionMeta[]
  onSelectRegion(id: string): void
  regionIdFromUrl: string | undefined
  content: RegionContentState & { retry(): void }
  /** Ảnh nhúng của vùng (Wikimedia Commons) */
  images: WebImage[]
  /** Dàn ý vùng (doc.md); null khi đang tải hoặc vùng chưa có */
  outline: RegionOutline | null
  provinceId: string | null
  onBack(): void
  onClearProvince(): void
  /** Mở modal dàn ý ngay trên trang bản đồ; topicId null = mục đầu tiên của phần */
  onOpenTopic(section: SectionId, topicId: string | null): void
  /** Mở modal tại mục dàn ý chứa mục nội dung này */
  onOpenItem(item: ContentItem): void
}

/** Địa điểm tiêu biểu: mục gắn với một tỉnh cụ thể, lấy lần lượt mỗi phần một mục; tối đa 3 */
function featuredPlaces(content: RegionContent): ContentItem[] {
  const order: SectionId[] = ['thien-nhien', 'lich-su', 'van-hoa', 'dan-cu-san-xuat']
  const groups = order.map((s) => getItemsBySection(content, s).filter((i) => i.provinceId))
  const out: ContentItem[] = []
  for (let round = 0; out.length < 3 && groups.some((g) => g[round]); round++) {
    for (const g of groups) {
      const item = g[round]
      if (item && out.length < 3) out.push(item)
    }
  }
  return out
}

export function MapInfoPanel(props: MapInfoPanelProps) {
  const { region, regionIdFromUrl, content, images, outline, provinceId, onBack, onClearProvince, onOpenTopic, onOpenItem } = props
  // Tỉnh mà em đã bấm sang tab Vùng; chọn tỉnh khác thì không còn khớp nên tự về tab Tỉnh của tỉnh mới
  const [regionTabFor, setRegionTabFor] = useState<string | null>(null)
  if (!regionIdFromUrl) return <RegionCards regions={props.regions} onSelect={props.onSelectRegion} />

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
  const webCover = cover ? undefined : imageLibrary.regionCover(images)
  // Có tỉnh đang chọn: thông tin tỉnh và thông tin vùng là hai tab riêng, không xếp chồng lên nhau
  const view: 'province' | 'region' = provinceId && regionTabFor !== provinceId ? 'province' : 'region'

  const provinceView = provinceId && (
    <ProvinceCard
      content={ready ?? undefined}
      regionName={region.name}
      provinceId={provinceId}
      images={images}
      onClear={onClearProvince}
      onOpen={onOpenItem}
      onShowRegion={() => setRegionTabFor(provinceId)}
    />
  )

  const regionView = (
    <>
      {webCover && <WebImageFigure image={webCover} priority sizes="(min-width: 1024px) 35vw, 100vw" aspect="16 / 7" />}

      <div className="flex gap-5">
        <div className={`w-28 shrink-0 ${webCover ? 'hidden' : ''}`}>
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
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Mountain aria-hidden className="size-8 shrink-0 text-secondary" />
            {region.name}
          </h2>
          {ready && <p className="text-muted">{ready.intro}</p>}
        </div>
      </div>

      {region.status === 'coming_soon' && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent-soft p-4">
          <Clock aria-hidden className="size-6 shrink-0 text-accent" />
          <p>Nội dung vùng {region.name} đang được chuẩn bị.</p>
        </div>
      )}
      {region.status === 'coming_soon' && outline && <OutlineSections outline={outline} items={[]} onOpen={onOpenTopic} />}
      {region.status === 'coming_soon' && <RegionGallery images={images} />}
      {region.status === 'active' && content.status === 'loading' && <LoadingState label="Đang tải nội dung vùng…" />}
      {region.status === 'active' && content.status === 'error' && (
        <ErrorState title="Chưa tải được nội dung vùng" onRetry={content.retry} />
      )}

      {ready && (
        <>
          {outline && <OutlineSections outline={outline} items={ready.items} onOpen={onOpenTopic} />}

          <FeaturedPlaces items={featuredPlaces(ready)} images={images} onOpen={onOpenItem} />

          <button
            type="button"
            onClick={() => onOpenTopic('thien-nhien', null)}
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-primary-dark px-5 text-lg font-bold text-white shadow-lg transition hover:bg-primary"
          >
            <BookOpen aria-hidden className="size-6" />
            Khám phá chi tiết vùng này
            <ChevronRight aria-hidden className="size-6" />
          </button>
        </>
      )}
    </>
  )

  return (
    <section aria-label={region.name} className={`${card} flex flex-col gap-6`}>
      <div className="-mb-4 -mt-2 flex justify-end">{back}</div>

      {provinceId ? (
        <>
          <ViewTabs
            view={view}
            provinceLabel={provinceName(provinceId) ?? provinceId}
            regionLabel={region.shortName}
            onChange={(v) => setRegionTabFor(v === 'region' ? provinceId : null)}
          />
          <div role="tabpanel" id={`map-info-${view}`} aria-labelledby={`map-info-tab-${view}`} className="flex flex-col gap-6">
            {view === 'province' ? provinceView : regionView}
          </div>
        </>
      ) : (
        regionView
      )}
    </section>
  )
}

interface ViewTabsProps {
  view: 'province' | 'region'
  provinceLabel: string
  regionLabel: string
  onChange(view: 'province' | 'region'): void
}

/** Hai tab Tỉnh | Vùng (chỉ có khi đang chọn một tỉnh); mũi tên trái/phải chuyển tab */
function ViewTabs({ view, provinceLabel, regionLabel, onChange }: ViewTabsProps) {
  const tabs = [
    { id: 'province' as const, kind: 'Tỉnh', label: provinceLabel, Icon: MapPin, on: 'bg-amber-400 text-white shadow-sm' },
    { id: 'region' as const, kind: 'Vùng', label: regionLabel, Icon: Mountain, on: 'bg-secondary text-white shadow-sm' },
  ]
  return (
    <div
      role="tablist"
      aria-label="Xem thông tin"
      className="grid grid-cols-2 gap-1 rounded-2xl bg-bg p-1"
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        const next = view === 'province' ? 'region' : 'province'
        onChange(next)
        document.getElementById(`map-info-tab-${next}`)?.focus()
      }}
    >
      {tabs.map(({ id, kind, label, Icon, on }) => (
        <button
          key={id}
          type="button"
          role="tab"
          id={`map-info-tab-${id}`}
          aria-selected={view === id}
          aria-controls={`map-info-${id}`}
          tabIndex={view === id ? 0 : -1}
          onClick={() => onChange(id)}
          className={`flex min-h-12 min-w-0 items-center gap-2 rounded-xl px-3 py-1.5 text-left transition ${
            view === id ? on : 'text-muted hover:bg-surface hover:text-ink'
          }`}
        >
          <Icon aria-hidden className="size-5 shrink-0" />
          <span className="min-w-0 leading-tight">
            <span className="block text-xs font-semibold opacity-80">{kind}</span>
            <span className="line-clamp-2 block font-bold">{label}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
