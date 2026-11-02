import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { SmartImage } from '../components/ui/SmartImage'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { getItemsByCategory, repository } from '../features/content/repository'
import { TOPIC_ICONS } from '../features/content/topicIcons'
import { panelId, tabId, TopicTabs } from '../features/content/TopicTabs'
import { useRegionContent } from '../features/content/useRegionContent'
import { useProgress } from '../features/progress/useProgress'
import { TOPIC_CATEGORIES, TOPIC_LABELS, type ContentItem, type TopicCategory } from '../types/content'

const isTopic = (v: string | null): v is TopicCategory => TOPIC_CATEGORIES.some((c) => c === v)

const backToMap = (
  <Link to="/ban-do" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-white">
    <ArrowLeft aria-hidden className="size-5" />
    Về bản đồ
  </Link>
)

export default function RegionPage() {
  const { regionId } = useParams()
  const [params, setParams] = useSearchParams()
  const region = repository.getRegions().find((r) => r.id === regionId) ?? null
  const content = useRegionContent(region?.status === 'active' ? region.id : undefined)
  const { markRegionVisited } = useProgress()
  const query = params.get('chu-de')
  const category: TopicCategory = isTopic(query) ? query : 'natural'

  useEffect(() => {
    if (region?.status === 'active') markRegionVisited(region.id)
  }, [region, markRegionVisited])

  if (!region) {
    return <EmptyState title="Không tìm thấy vùng này" description="Em hãy quay lại bản đồ để chọn vùng khác nhé." action={backToMap} />
  }

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Đường dẫn" className="text-sm text-muted">
        <Link to={`/ban-do/${region.id}`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          Bản đồ khám phá
        </Link>
      </nav>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold" style={{ color: `var(--color-${region.color})` }}>
          {region.name}
        </h1>
        {content.status === 'ready' && <p className="max-w-3xl text-lg">{content.content.intro}</p>}
      </header>

      {region.status === 'coming_soon' && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent-soft p-4">
          <Clock aria-hidden className="size-6 shrink-0 text-accent" />
          <p>Nội dung vùng {region.name} đang được chuẩn bị.</p>
        </div>
      )}
      {region.status === 'active' && content.status === 'loading' && <LoadingState label="Đang tải nội dung vùng…" />}
      {region.status === 'active' && (content.status === 'error' || content.status === 'not_found') && (
        <ErrorState title="Chưa tải được nội dung vùng" onRetry={content.retry} />
      )}
      {content.status === 'ready' && (
        <>
          <TopicTabs
            selected={category}
            counts={Object.fromEntries(TOPIC_CATEGORIES.map((c) => [c, getItemsByCategory(content.content, c).length])) as Record<TopicCategory, number>}
            onSelect={(c) => setParams({ 'chu-de': c }, { replace: true })}
          />
          <div role="tabpanel" id={panelId(category)} aria-labelledby={tabId(category)} tabIndex={0} className="rounded-card">
            <TopicPanel items={getItemsByCategory(content.content, category)} />
          </div>
        </>
      )}
    </div>
  )
}

function TopicPanel({ items }: { items: ContentItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="Nội dung đang được cập nhật" description="Em hãy xem các chủ đề khác trước nhé!" />
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li key={item.id}>
          <ItemCard item={item} />
        </li>
      ))}
    </ul>
  )
}

function ItemCard({ item }: { item: ContentItem }) {
  const Icon = TOPIC_ICONS[item.category]
  const image = item.images[0]
  return (
    <Link
      to={`/dia-danh/${item.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border-2 border-line bg-surface transition-colors hover:border-primary"
    >
      {image ? (
        <SmartImage image={image} sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="rounded-none" />
      ) : (
        <div aria-hidden className="flex h-28 items-center justify-center bg-primary-soft">
          <Icon className="size-12 text-primary" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{TOPIC_LABELS[item.category]}</span>
        <h2 className="text-lg font-bold group-hover:text-primary">{item.title}</h2>
        <p className="flex-1 text-muted">{item.summary}</p>
        <span className="inline-flex items-center gap-1 font-semibold text-primary">
          Khám phá
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </Link>
  )
}
