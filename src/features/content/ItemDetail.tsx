import { BookOpen, ExternalLink, ImageIcon, Lightbulb, MapPin, Sparkles, Star, Volume2 } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { SmartImage } from '../../components/ui/SmartImage'
import { WebImageFigure } from '../../components/ui/WebImageFigure'
import { provinceName, provinceNamesOfRegion } from '../../lib/provinces'
import { SGK_URL, sgkPageUrl } from '../../lib/sources'
import { SECTION_LABELS, type ContentItem, type MediaRef, type SourceRef, type SectionId, type WebImage } from '../../types/content'
import { itemSlug } from './links'
import { SECTION_ICONS } from './sectionIcons'

interface ItemDetailProps {
  item: ContentItem
  regionName: string
  /** Ảnh nhúng (Wikimedia Commons) minh hoạ mục này */
  webImages?: WebImage[]
  related: ContentItem[]
  onSelectRelated(section: SectionId, slug: string): void
}

/** Toàn bộ thông tin một mục nội dung; dùng trong modal chủ đề */
export function ItemDetail({ item, regionName, webImages = [], related, onSelectRelated }: ItemDetailProps) {
  const Icon = SECTION_ICONS[item.section]
  const figures = item.figures ?? []
  const province = provinceName(item.provinceId)
  const regionProvinces = province ? [] : provinceNamesOfRegion(item.regionId)
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
          <Icon aria-hidden className="size-4" />
          {SECTION_LABELS[item.section]}
        </span>
        <h3 tabIndex={-1} data-item-heading className="text-3xl font-bold outline-none">
          {item.title}
        </h3>
        <div data-testid="item-place" className="flex flex-col gap-2 text-muted">
          <p className="flex flex-wrap items-center gap-2">
            <MapPin aria-hidden className="size-5 shrink-0 text-amber-600" />
            {province ? (
              <>
                <span className="rounded-full bg-amber-100 px-3 py-0.5 font-bold text-amber-900">Tỉnh {province}</span>
                <span>thuộc vùng {regionName}</span>
              </>
            ) : (
              <span>
                <span className="font-semibold">Toàn vùng {regionName}</span>
                {regionProvinces.length > 0 && <>, gồm {regionProvinces.length} tỉnh:</>}
              </span>
            )}
          </p>
          {regionProvinces.length > 0 && (
            <ul aria-label="Các tỉnh trong vùng" className="flex flex-wrap gap-1.5 pl-7">
              {regionProvinces.map((name) => (
                <li key={name} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {item.location && (
          <p className="flex items-center gap-2 text-muted">
            <MapPin aria-hidden className="size-5 text-secondary" />
            <span className="font-semibold">Vị trí</span>
            <span>{item.location.placeName}</span>
          </p>
        )}
        <p className="text-lg">{item.summary}</p>
      </header>

      {item.images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {item.images.map((img, i) => (
            <SmartImage key={img.imageId} image={img} priority={i === 0} showCredit sizes="(min-width: 1024px) 35vw, 50vw" />
          ))}
        </div>
      )}

      {webImages.length > 0 && (
        <Section title="Hình ảnh" icon={<ImageIcon aria-hidden className="size-6 text-primary" />}>
          <ul className="grid gap-4 sm:grid-cols-2">
            {webImages.map((img, i) => (
              <li key={img.id}>
                <WebImageFigure image={img} priority={i === 0} showCaption sizes="(min-width: 1024px) 30vw, 50vw" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {figures.length > 0 && (
        <Section title="Hình minh hoạ trong SGK" icon={<ImageIcon aria-hidden className="size-6 text-primary" />}>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {figures.map((f) => (
              <li key={`${f.lesson}-${f.figure}`}>
                <a
                  href={sgkPageUrl(f.page)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Xem Hình ${f.figure} (Bài ${f.lesson}) trong SGK, trang ${f.page}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border-2 border-line bg-bg p-4 transition-colors hover:border-primary hover:bg-primary-soft"
                >
                  <span className="flex items-center justify-between text-sm font-semibold text-muted">
                    <span>
                      Hình {f.figure} · Bài {f.lesson}
                    </span>
                    <span>Trang {f.page}</span>
                  </span>
                  <span className="flex-1 font-semibold">{f.caption}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Xem trong SGK
                    <ExternalLink aria-hidden className="size-4" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {item.images.length === 0 && (
            <p className="mt-3 text-sm text-muted">Hình trong SGK thuộc bản quyền Nhà xuất bản Giáo dục Việt Nam; em bấm vào thẻ để xem hình trong sách.</p>
          )}
        </Section>
      )}

      {item.audio && <AudioPlayer audio={item.audio} />}

      <div className="grid gap-6 xl:grid-cols-2">
        {item.highlights.length > 0 && (
          <Section title="Điều nổi bật" icon={<Star aria-hidden className="size-6 text-accent" />}>
            <ul className="flex flex-col gap-2">
              {item.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-accent" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        <div className="flex flex-col gap-6">
          {item.keyPoints.length > 0 && (
            <Section title="Ghi nhớ" icon={<Lightbulb aria-hidden className="size-6 text-secondary" />} tone="bg-secondary-soft">
              <ol className="flex list-decimal flex-col gap-2 pl-5 font-semibold">
                {item.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ol>
            </Section>
          )}
          {item.funFacts && item.funFacts.length > 0 && (
            <Section title="Em có biết?" icon={<Sparkles aria-hidden className="size-6 text-primary" />} tone="bg-primary-soft">
              <ul className="flex flex-col gap-2">
                {item.funFacts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <Section title="Khám phá thêm">
          <ul className="flex flex-wrap gap-2">
            {related.map((r) => {
              const RIcon = SECTION_ICONS[r.section]
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onSelectRelated(r.section, itemSlug(r.id))}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-line px-4 font-semibold hover:border-primary hover:bg-primary-soft"
                  >
                    <RIcon aria-hidden className="size-5 text-primary" />
                    {r.title}
                  </button>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {item.sources.length > 0 && (
        <Section title="Nguồn tham khảo" icon={<BookOpen aria-hidden className="size-5 text-muted" />}>
          <ul className="flex flex-col gap-1 text-sm">
            {item.sources.map((s) => (
              <li key={`${s.title}-${s.note ?? ''}`} className="flex flex-wrap gap-x-2">
                <SourceLink source={s} />
                {s.note && <span className="text-muted">{s.note}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  )
}

function SourceLink({ source }: { source: SourceRef }) {
  const href = source.url === SGK_URL && source.page ? sgkPageUrl(source.page) : source.url
  if (!href) return <span className="font-semibold">{source.title}</span>
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
      {source.title}
    </a>
  )
}

function Section({ title, icon, tone = 'bg-surface', children }: { title: string; icon?: ReactNode; tone?: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={`rounded-card p-5 shadow-sm ${tone}`}>
      <h4 id={id} className="mb-3 flex items-center gap-2 text-xl font-bold">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  )
}

function AudioPlayer({ audio }: { audio: MediaRef }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-sm">
      <p className="flex items-center gap-2 font-semibold">
        <Volume2 aria-hidden className="size-5 text-primary" />
        Nghe thuyết minh
      </p>
      {failed ? (
        <p className="text-muted">Chưa nghe được thuyết minh</p>
      ) : (
        <audio controls preload="none" src={audio.src} onError={() => setFailed(true)} className="w-full" />
      )}
      <p className="text-xs text-muted">
        {audio.credit} · {audio.license}
      </p>
    </div>
  )
}
