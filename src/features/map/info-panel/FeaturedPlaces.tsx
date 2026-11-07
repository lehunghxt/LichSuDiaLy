import { ChevronRight, MapPin } from 'lucide-react'
import { ImageCredit } from '../../../components/ui/ImageCredit'
import { SmartImage } from '../../../components/ui/SmartImage'
import { provinceName } from '../../../lib/provinces'
import { SECTION_LABELS, type ContentItem, type WebImage } from '../../../types/content'
import { SECTION_ICONS, SECTION_TILE } from '../../content/sectionIcons'
import { imageLibrary } from '../../images/library'

export interface FeaturedPlacesProps {
  items: ContentItem[]
  images: WebImage[]
  onOpen(item: ContentItem): void
}

export function FeaturedPlaces({ items, images, onOpen }: FeaturedPlacesProps) {
  if (items.length === 0) return null
  return (
    <div className="border-t border-line pt-5">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <MapPin aria-hidden className="size-6 text-primary" />
        Một số địa điểm tiêu biểu
      </h3>
      <ul aria-label="Một số địa điểm tiêu biểu" className="flex flex-col gap-2.5">
        {items.map((i) => {
          const Icon = SECTION_ICONS[i.section]
          const image = i.images[0]
          const webImage = image ? undefined : imageLibrary.forItem(images, i.id)[0]
          return (
            <li key={i.id} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
              <button
                type="button"
                onClick={() => onOpen(i)}
                className="flex w-full items-center gap-3 p-2.5 text-left transition-colors hover:bg-primary-soft"
              >
                {image ? (
                  <SmartImage image={image} sizes="80px" className="size-16 shrink-0 rounded-xl" />
                ) : webImage ? (
                  <img
                    src={webImage.src.url}
                    srcSet={webImage.src.srcset.map((x) => `${x.url} ${x.width}w`).join(', ')}
                    sizes="80px"
                    alt={webImage.alt}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="size-16 shrink-0 rounded-xl bg-line object-cover"
                  />
                ) : (
                  <span
                    aria-hidden
                    className={`flex size-16 shrink-0 items-center justify-center rounded-xl ${SECTION_TILE[i.section].tile}`}
                  >
                    <Icon className={`size-8 ${SECTION_TILE[i.section].icon}`} strokeWidth={1.75} />
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-bold leading-snug">{i.title}</span>
                  <span className="flex items-center gap-1 text-sm text-muted">
                    <MapPin aria-hidden className="size-3.5 shrink-0 text-rose-500" />
                    {provinceName(i.provinceId)} · {SECTION_LABELS[i.section]}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-muted" />
              </button>
              {/* Ghi nguồn ảnh Commons (TASL) ngay dưới hàng, thẳng cột với chữ */}
              {webImage && (
                <p className="-mt-1 line-clamp-2 pb-2.5 pl-[5.375rem] pr-3 leading-tight">
                  <ImageCredit image={webImage} />
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
