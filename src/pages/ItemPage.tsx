import { ArrowLeft, BookOpen, Lightbulb, MapPin, Sparkles, Star, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { SmartImage } from '../components/ui/SmartImage'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { repository } from '../features/content/repository'
import { TOPIC_ICONS } from '../features/content/topicIcons'
import { useProgress } from '../features/progress/useProgress'
import { TOPIC_LABELS, type ContentItem, type MediaRef, type RegionContent } from '../types/content'

type ItemState =
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error' }
  | { status: 'ready'; item: ContentItem; content: RegionContent }

function useItem(itemId: string | undefined) {
  const [state, setState] = useState<ItemState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    const load = itemId ? repository.findItem(itemId) : Promise.resolve(null)
    load.then(
      (found) => {
        if (!cancelled) setState(found ? { status: 'ready', ...found } : { status: 'not_found' })
      },
      () => {
        if (!cancelled) setState({ status: 'error' })
      },
    )
    return () => {
      cancelled = true
    }
  }, [itemId, attempt])
  return { state, retry: () => setAttempt((n) => n + 1) }
}

const backLink = (to: string) => (
  <Link to={to} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-white hover:bg-primary-dark">
    <ArrowLeft aria-hidden className="size-5" />
    Về bản đồ
  </Link>
)

export default function ItemPage() {
  const { itemId } = useParams()
  const { state, retry } = useItem(itemId)
  const { markItemViewed } = useProgress()
  const viewedId = state.status === 'ready' ? state.item.id : null

  useEffect(() => {
    if (viewedId) markItemViewed(viewedId)
  }, [viewedId, markItemViewed])

  if (state.status === 'loading') return <LoadingState label="Đang tải địa danh…" />
  if (state.status === 'error') return <ErrorState title="Chưa tải được nội dung" onRetry={retry} />
  if (state.status === 'not_found') {
    return <EmptyState title="Không tìm thấy địa danh này" description="Em hãy quay lại bản đồ để khám phá tiếp nhé." action={backLink('/ban-do')} />
  }

  const { item, content } = state
  const Icon = TOPIC_ICONS[item.category]
  const related = item.relatedIds
    .map((id) => content.items.find((i) => i.id === id))
    .filter((i): i is ContentItem => i !== undefined)

  return (
    <article className="flex flex-col gap-6">
      <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-sm">
        {backLink(`/ban-do/${content.region.id}`)}
        <Link to={`/vung/${content.region.id}?chu-de=${item.category}`} className="font-semibold text-primary hover:underline">
          {content.region.name}
        </Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <Link
              to={`/vung/${content.region.id}?chu-de=${item.category}`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary"
            >
              <Icon aria-hidden className="size-4" />
              {TOPIC_LABELS[item.category]}
            </Link>
            <h1 className="text-3xl font-bold">{item.title}</h1>
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
                <SmartImage key={img.imageId} image={img} priority={i === 0} showCredit sizes="(min-width: 1024px) 30vw, 50vw" />
              ))}
            </div>
          )}

          {item.audio && <AudioPlayer audio={item.audio} />}

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

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          {item.keyPoints.length > 0 && (
            <Section title="Ghi nhớ" icon={<Lightbulb aria-hidden className="size-6 text-secondary" />} tone="bg-secondary-soft">
              <ol className="flex list-decimal flex-col gap-2 pl-5 font-semibold">
                {item.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ol>
            </Section>
          )}

          {related.length > 0 && (
            <Section title="Khám phá thêm">
              <ul className="flex flex-col gap-2">
                {related.map((r) => {
                  const RIcon = TOPIC_ICONS[r.category]
                  return (
                    <li key={r.id}>
                      <Link
                        to={`/dia-danh/${r.id}`}
                        className="flex min-h-12 items-center gap-3 rounded-2xl border-2 border-line px-4 py-2 font-semibold hover:border-primary hover:bg-primary-soft"
                      >
                        <RIcon aria-hidden className="size-5 text-primary" />
                        {r.title}
                      </Link>
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
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                        {s.title}
                      </a>
                    ) : (
                      <span className="font-semibold">{s.title}</span>
                    )}
                    {s.note && <span className="text-muted">{s.note}</span>}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </aside>
      </div>
    </article>
  )
}

function Section({ title, icon, tone = 'bg-surface', children }: { title: string; icon?: React.ReactNode; tone?: string; children: React.ReactNode }) {
  const id = `section-${title.replace(/\s+/g, '-')}`
  return (
    <section aria-labelledby={id} className={`rounded-card p-5 shadow-sm ${tone}`}>
      <h2 id={id} className="mb-3 flex items-center gap-2 text-xl font-bold">
        {icon}
        {title}
      </h2>
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
