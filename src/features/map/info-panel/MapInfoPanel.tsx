import { ArrowLeft, BookOpen, Clock, MapPin, Mountain } from 'lucide-react'
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
import { RegionCrops } from '../../produce'
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
      onOpen={onOpenItem}
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

          <RegionCrops regionId={region.id} />

          <button
            type="button"
            onClick={() => onOpenTopic('thien-nhien', null)}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-primary-dark px-4 py-2.5 text-base font-bold leading-tight text-white shadow-lg transition hover:bg-primary"
          >
            {/* Biểu tượng nằm trong dòng chữ: phải xuống dòng thì vẫn đứng sát chữ đầu */}
            <span className="text-balance text-center">
              <BookOpen aria-hidden className="mr-2 inline size-5 align-[-0.2em]" />
              Khám phá chi tiết vùng này
            </span>
          </button>
        </>
      )}
    </>
  )

  return (
    <section aria-label={region.name} className={`${card} flex flex-col gap-6 in-data-sheet:gap-4`}>
      {provinceId ? (
        <>
          {/* Nút lùi một bước (bỏ chọn tỉnh, về vùng) thu thành nút tròn cùng hàng với tab, không chiếm riêng một dòng */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearProvince}
              aria-label={`Bỏ chọn tỉnh, về vùng ${region.name}`}
              title={`Về vùng ${region.name}`}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-bg text-muted ring-1 ring-line hover:text-ink"
            >
              <ArrowLeft aria-hidden className="size-5" />
            </button>
            <ViewTabs
              view={view}
              provinceLabel={provinceName(provinceId) ?? provinceId}
              regionName={region.name}
              onChange={(v) => setRegionTabFor(v === 'region' ? provinceId : null)}
            />
          </div>
          <div role="tabpanel" id={`map-info-${view}`} aria-labelledby={`map-info-tab-${view}`} className="flex flex-col gap-6">
            {view === 'province' ? provinceView : regionView}
          </div>
        </>
      ) : (
        <>
          <div className="-mb-4 -mt-2 flex justify-end in-data-sheet:-mb-2 in-data-sheet:mt-0">{back}</div>
          {regionView}
        </>
      )}
    </section>
  )
}

interface ViewTabsProps {
  view: 'province' | 'region'
  provinceLabel: string
  regionName: string
  onChange(view: 'province' | 'region'): void
}

/** Hai tab Tỉnh | Cả vùng (chỉ có khi đang chọn một tỉnh), nhãn ngắn một dòng: tên vùng đã có ở tiêu đề nội dung.
 *  Mũi tên trái/phải chuyển tab */
function ViewTabs({ view, provinceLabel, regionName, onChange }: ViewTabsProps) {
  const tabs = [
    { id: 'province' as const, kind: 'Tỉnh', label: provinceLabel, title: undefined, Icon: MapPin, on: 'text-amber-700' },
    { id: 'region' as const, kind: '', label: 'Cả vùng', title: `Thông tin vùng ${regionName}`, Icon: Mountain, on: 'text-secondary' },
  ]
  return (
    <div
      role="tablist"
      aria-label="Xem thông tin"
      className="grid min-w-0 flex-1 grid-cols-2 gap-1 rounded-full bg-bg p-1 ring-1 ring-line"
      onKeyDown={(e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        const next = view === 'province' ? 'region' : 'province'
        onChange(next)
        document.getElementById(`map-info-tab-${next}`)?.focus()
      }}
    >
      {tabs.map(({ id, kind, label, title, Icon, on }) => (
        <button
          key={id}
          type="button"
          role="tab"
          id={`map-info-tab-${id}`}
          aria-selected={view === id}
          aria-controls={`map-info-${id}`}
          tabIndex={view === id ? 0 : -1}
          title={title}
          onClick={() => onChange(id)}
          className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-bold transition ${
            view === id ? `bg-surface shadow-sm ${on}` : 'text-muted hover:text-ink'
          }`}
        >
          <Icon aria-hidden className="size-4 shrink-0" />
          {/* "Tỉnh" chỉ cho trình đọc màn hình: biểu tượng ghim đã nói đây là tỉnh, nhường chỗ cho tên */}
          <span className="truncate">
            {kind && (
              <>
                <span className="sr-only">{kind}</span>{' '}
              </>
            )}
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
