import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { itemSlug, topicSearch } from '../features/content/links'
import { repository } from '../features/content/repository'
import type { ContentItem } from '../types/content'

type State = { status: 'loading' } | { status: 'not_found' } | { status: 'error' } | { status: 'ready'; item: ContentItem }

/** Link /dia-danh/<id> (ví dụ từ trang Tiến độ): chuyển tới bản đồ và mở modal đúng mục */
export default function ItemPage() {
  const { itemId } = useParams()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    const load = itemId ? repository.findItem(itemId) : Promise.resolve(null)
    load.then(
      (found) => {
        if (!cancelled) setState(found ? { status: 'ready', item: found.item } : { status: 'not_found' })
      },
      () => {
        if (!cancelled) setState({ status: 'error' })
      },
    )
    return () => {
      cancelled = true
    }
  }, [itemId, attempt])

  if (state.status === 'loading') return <LoadingState label="Đang tải địa danh…" />
  if (state.status === 'error') return <ErrorState title="Chưa tải được nội dung" onRetry={() => setAttempt((n) => n + 1)} />
  if (state.status === 'not_found') {
    return (
      <EmptyState
        title="Không tìm thấy địa danh này"
        description="Em hãy quay lại bản đồ để khám phá tiếp nhé."
        action={
          <Link to="/ban-do" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-white">
            <ArrowLeft aria-hidden className="size-5" />
            Về bản đồ
          </Link>
        }
      />
    )
  }
  const { item } = state
  return <Navigate replace to={`/ban-do/${item.regionId}${topicSearch(item.section, itemSlug(item.id))}`} />
}
