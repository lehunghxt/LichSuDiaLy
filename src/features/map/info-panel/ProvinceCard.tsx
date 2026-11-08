import { MapPin, X } from 'lucide-react'
import { useMemo } from 'react'
import { WebImageFigure } from '../../../components/ui/WebImageFigure'
import { formedFrom, formerUnits, provinceName, provinceTitle } from '../../../lib/provinces'
import { provinceMentions } from '../mentions'
import { provinceFacts } from '../profiles'
import { type ContentItem, type RegionContent, type WebImage } from '../../../types/content'
import { SECTION_ICONS, SECTION_TILE } from '../../content'
import { imageLibrary } from '../../images'

export interface ProvinceCardProps {
  /** Không có khi vùng chưa có nội dung (Sắp ra mắt) */
  content?: RegionContent
  regionName: string
  images: WebImage[]
  provinceId: string
  onClear(): void
  onOpen(item: ContentItem): void
}

// Danh sách tỉnh mới và các tỉnh cũ hợp nhất, theo Nghị quyết 202/2025/QH15 (báo Nhân Dân đăng toàn văn danh sách)
const MERGER_SOURCE =
  'https://nhandan.vn/quoc-hoi-thong-qua-nghi-quyet-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-ca-nuoc-con-34-tinh-thanh-post886206.html'

/** Tỉnh đang chọn trên bản đồ: tên, vùng, các mục trong bài học gắn với tỉnh */
export function ProvinceCard({ content, regionName, provinceId, images, onClear, onOpen }: ProvinceCardProps) {
  const name = provinceName(provinceId) ?? provinceId
  const items = content?.items.filter((i) => i.provinceId === provinceId) ?? []
  const facts = provinceFacts(provinceId)
  const former = formedFrom(provinceId)
  const title = provinceTitle(provinceId)
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
          <h3 className="text-xl font-bold leading-tight">{title}</h3>
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
      <div data-testid="province-history" className="rounded-xl bg-white/70 p-3 text-sm">
        {former.length > 0 ? (
          <>
            <p className="font-semibold">
              Từ năm 2025, {title.charAt(0).toLowerCase() + title.slice(1)} được hợp nhất từ {formerUnits(provinceId)} cũ:
            </p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {former.map((n) => (
                <li key={n} className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-900">
                  {n}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="font-semibold">{title} giữ nguyên, không hợp nhất trong đợt sắp xếp năm 2025.</p>
        )}
        <a
          href={MERGER_SOURCE}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-block text-xs text-muted underline hover:text-ink"
        >
          Theo Nghị quyết 202/2025/QH15 của Quốc hội
        </a>
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
      {!content ? null : items.length === 0 && mentions.length === 0 && facts.length === 0 ? (
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
      {facts.length > 0 && (
        <section
          aria-label={`Tìm hiểu thêm về tỉnh ${name}`}
          className="flex flex-col gap-2 rounded-xl border border-dashed border-amber-300 bg-white/70 p-3"
        >
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            Tìm hiểu thêm
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Ngoài SGK</span>
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">
            {facts.map((f) => (
              <li key={f.text}>
                {f.text}{' '}
                {f.source.url && (
                  <a
                    href={f.source.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Nguồn: ${f.source.title}`}
                    title={f.source.title}
                    className="text-xs text-muted underline hover:text-ink"
                  >
                    (nguồn)
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
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
