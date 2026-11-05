import { ArrowLeft, BookOpen, ChevronRight, Clock, Compass, ImageIcon, MapPin, Mountain, X } from 'lucide-react'
import { useMemo } from 'react'
import { SmartImage } from '../../components/ui/SmartImage'
import { WebImageFigure } from '../../components/ui/WebImageFigure'
import { provinceName } from '../../lib/provinces'
import { provinceMentions } from './mentions'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import {
  SECTION_LABELS,
  type ContentItem,
  type RegionContent,
  type RegionMeta,
  type RegionOutline,
  type SectionId,
  type WebImage,
} from '../../types/content'
import { getItemsBySection } from '../content/repository'
import { SECTION_ICONS, SECTION_TILE } from '../content/sectionIcons'
import { imageLibrary, interleaveByProvince } from '../images/library'
import type { RegionContentState } from '../content/useRegionContent'

interface MapInfoPanelProps {
  region: RegionMeta | null
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

const card = 'rounded-card bg-surface p-6 shadow-[0_8px_30px_rgb(15_23_42/0.08)]'

export function MapInfoPanel(props: MapInfoPanelProps) {
  const { region, regionIdFromUrl, content, images, outline, provinceId, onBack, onClearProvince, onOpenTopic, onOpenItem } = props
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
  const webCover = cover ? undefined : imageLibrary.regionCover(images)

  return (
    <section aria-label={region.name} className={`${card} flex flex-col gap-6`}>
      <div className="-mb-4 -mt-2 flex justify-end">{back}</div>

      {webCover && <WebImageFigure image={webCover} priority sizes="(min-width: 1024px) 35vw, 100vw" aspect="16 / 7" />}

      <div className="flex gap-5">
        <div className={`w-28 shrink-0 2xl:w-36 ${webCover ? 'hidden' : ''}`}>
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
      </div>

      {region.status === 'coming_soon' && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent-soft p-4">
          <Clock aria-hidden className="size-6 shrink-0 text-accent" />
          <p>Nội dung vùng {region.name} đang được chuẩn bị.</p>
        </div>
      )}
      {region.status === 'coming_soon' && provinceId && (
        <ProvinceCard regionName={region.name} provinceId={provinceId} images={images} onClear={onClearProvince} onOpen={onOpenItem} />
      )}
      {region.status === 'coming_soon' && outline && <OutlineSections outline={outline} items={[]} onOpen={onOpenTopic} />}
      {region.status === 'coming_soon' && <RegionGallery images={images} />}
      {region.status === 'active' && content.status === 'loading' && <LoadingState label="Đang tải nội dung vùng…" />}
      {region.status === 'active' && content.status === 'error' && (
        <ErrorState title="Chưa tải được nội dung vùng" onRetry={content.retry} />
      )}

      {ready && (
        <>
          {provinceId && (
            <ProvinceCard
              content={ready}
              regionName={region.name}
              provinceId={provinceId}
              images={images}
              onClear={onClearProvince}
              onOpen={onOpenItem}
            />
          )}

          {outline && <OutlineSections outline={outline} items={ready.items} onOpen={onOpenTopic} />}

          <FeaturedPlaces items={featuredPlaces(ready)} images={images} onOpen={onOpenItem} />

          <button
            type="button"
            onClick={() => onOpenTopic('thien-nhien', null)}
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

interface FeaturedPlacesProps {
  items: ContentItem[]
  images: WebImage[]
  onOpen(item: ContentItem): void
}

function FeaturedPlaces({ items, images, onOpen }: FeaturedPlacesProps) {
  if (items.length === 0) return null
  return (
    <div className="border-t border-line pt-5">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <MapPin aria-hidden className="size-6 text-primary" />
        Một số địa điểm tiêu biểu
      </h3>
      <ul aria-label="Một số địa điểm tiêu biểu" className="grid grid-cols-3 gap-3">
        {items.map((i) => {
          const Icon = SECTION_ICONS[i.section]
          const image = i.images[0]
          const webImage = image ? undefined : imageLibrary.forItem(images, i.id)[0]
          return (
            <li key={i.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
              {image ? (
                <SmartImage image={image} sizes="200px" className="aspect-[4/3] rounded-none" />
              ) : webImage ? (
                <WebImageFigure image={webImage} sizes="200px" className="p-1.5" />
              ) : (
                <span aria-hidden className={`flex aspect-[4/3] items-center justify-center ${SECTION_TILE[i.section].tile}`}>
                  <Icon className={`size-10 ${SECTION_TILE[i.section].icon}`} strokeWidth={1.75} />
                </span>
              )}
              <button
                type="button"
                onClick={() => onOpen(i)}
                className="mt-auto flex w-full text-left transition-colors hover:bg-primary-soft"
              >
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

interface ProvinceCardProps {
  /** Không có khi vùng chưa có nội dung (Sắp ra mắt) */
  content?: RegionContent
  regionName: string
  images: WebImage[]
  provinceId: string
  onClear(): void
  onOpen(item: ContentItem): void
}

/** Tỉnh đang chọn trên bản đồ: tên, vùng, các mục trong bài học gắn với tỉnh */
function ProvinceCard({ content, regionName, provinceId, images, onClear, onOpen }: ProvinceCardProps) {
  const name = provinceName(provinceId) ?? provinceId
  const items = content?.items.filter((i) => i.provinceId === provinceId) ?? []
  const mentions = useMemo(() => (content ? provinceMentions(content.items, provinceId) : []), [content, provinceId])
  const photos = imageLibrary.forProvince(images, provinceId).slice(0, 4)
  return (
    <section
      aria-label={`Tỉnh đang xem: ${name}`}
      className="animate-fade-up flex flex-col gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
          <MapPin aria-hidden className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Tỉnh đang xem</p>
          <h3 className="text-xl font-bold leading-tight">Tỉnh {name}</h3>
          <p className="text-sm text-muted">Thuộc vùng {regionName}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Bỏ chọn tỉnh"
          title="Bỏ chọn tỉnh"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-amber-100 hover:text-ink"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>
      {photos.length > 0 && (
        <ul aria-label={`Hình ảnh tỉnh ${name}`} className="grid grid-cols-2 gap-3">
          {photos.map((img) => (
            <li key={img.id}>
              <WebImageFigure image={img} showCaption sizes="(min-width: 1024px) 15vw, 50vw" />
            </li>
          ))}
        </ul>
      )}
      {!content ? null : items.length === 0 && mentions.length === 0 ? (
        <p className="text-sm text-muted">Bài học chưa có địa danh nào của tỉnh này. Em xem các phần bên dưới nhé!</p>
      ) : items.length === 0 ? null : (
        <>
          <p className="text-sm font-semibold">
            Trong bài học có {items.length} mục ở tỉnh {name}:
          </p>
          <ul aria-label={`Địa danh ở tỉnh ${name}`} className="flex flex-wrap gap-2">
            {items.map((i) => {
              const Icon = SECTION_ICONS[i.section]
              return (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(i)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-amber-200 bg-white px-3 text-sm font-semibold shadow-sm hover:border-amber-400"
                  >
                    <Icon aria-hidden className={`size-4 ${SECTION_TILE[i.section].icon}`} />
                    {i.title}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
      {mentions.length > 0 && (
        <>
          <p className="text-sm font-semibold">Bài học còn nhắc tới tỉnh {name}:</p>
          <ul aria-label={`Bài học nhắc tới tỉnh ${name}`} className="flex flex-col gap-2">
            {mentions.map(({ item, sentences }) => {
              const Icon = SECTION_ICONS[item.section]
              return (
                <li key={item.id} className="rounded-xl border border-amber-200 bg-white p-3 text-sm shadow-sm">
                  {sentences.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  <button
                    type="button"
                    onClick={() => onOpen(item)}
                    aria-label={`Xem mục ${item.title}`}
                    className="mt-1.5 inline-flex min-h-9 items-center gap-1.5 font-semibold text-primary hover:underline"
                  >
                    <Icon aria-hidden className={`size-4 ${SECTION_TILE[item.section].icon}`} />
                    {item.title}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}

interface OutlineSectionsProps {
  outline: RegionOutline
  /** Mục nội dung đã tải (đã lọc theo quy tắc xuất bản); mục dàn ý không có mục nào ở đây là "đang cập nhật" */
  items: ContentItem[]
  onOpen(section: SectionId, topicId: string): void
}

/** Dàn ý vùng: mỗi phần một thẻ, liệt kê các mục; mục chưa có nội dung màu xám */
function OutlineSections({ outline, items, onOpen }: OutlineSectionsProps) {
  const ids = new Set(items.map((i) => i.id))
  return (
    <nav aria-label="Dàn ý vùng" className="flex flex-col gap-3 border-t border-line pt-5">
      {outline.sections.map((section) => {
        const Icon = SECTION_ICONS[section.id]
        const style = SECTION_TILE[section.id]
        const label = SECTION_LABELS[section.id]
        const filled = section.topics.filter((t) => t.itemIds.some((id) => ids.has(id))).length
        return (
          <div key={section.id} className={`rounded-2xl border-2 p-3 ${style.tile}`}>
            <div className="mb-2 flex items-center gap-2">
              <Icon aria-hidden className={`size-6 shrink-0 ${style.icon}`} strokeWidth={1.75} />
              <h3 className="flex-1 text-base font-bold leading-snug">{label}</h3>
              <p className="shrink-0 text-xs font-semibold text-muted">
                {filled}/{section.topics.length} mục có nội dung
              </p>
            </div>
            {section.topics.length === 0 ? (
              <p className="text-sm text-muted">Nội dung đang được cập nhật.</p>
            ) : (
              <ul aria-label={label} className="flex flex-wrap gap-1.5">
                {section.topics.map((t) => {
                  const empty = !t.itemIds.some((id) => ids.has(id))
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        data-topic={t.id}
                        title={t.hint ? `${t.title} ${t.hint}` : t.title}
                        onClick={() => onOpen(section.id, t.id)}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-left text-sm leading-snug transition-colors ${
                          empty
                            ? 'border-dashed border-line bg-white/60 text-muted hover:bg-white'
                            : 'border-transparent bg-white font-semibold shadow-sm hover:border-current'
                        }`}
                      >
                        {t.title}
                        {empty && <span className="whitespace-nowrap text-xs font-normal italic">(đang cập nhật)</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}

/** Ảnh của vùng chưa có nội dung bài học: xem trước cảnh quan, văn hoá theo từng chủ đề */
function RegionGallery({ images }: { images: WebImage[] }) {
  if (images.length === 0) return null
  return (
    <section aria-label="Hình ảnh của vùng" className="border-t border-line pt-5">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <ImageIcon aria-hidden className="size-6 text-primary" />
        Hình ảnh của vùng
      </h3>
      <ul className="grid grid-cols-2 gap-4">
        {interleaveByProvince(images)
          .slice(0, 8)
          .map((img) => (
            <li key={img.id}>
              <WebImageFigure image={img} showCaption sizes="(min-width: 1024px) 18vw, 50vw" />
            </li>
          ))}
      </ul>
    </section>
  )
}
