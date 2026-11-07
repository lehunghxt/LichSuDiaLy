import { BookOpenCheck, Eye, Map, Star, Trash2, Trophy, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { repository } from '../features/content/repository'
import type { QuizRecord } from '../features/progress/progress'
import { useProgress } from '../features/progress/useProgress'
import type { ContentItem } from '../types/content'
import { GRID } from '../components/ui/grid'

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="flex items-center gap-4 rounded-card bg-surface p-5 shadow-sm">
      <Icon aria-hidden className="size-10 shrink-0 rounded-full bg-primary-soft p-2 text-primary" />
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </li>
  )
}

function latest(records: QuizRecord[]): QuizRecord | undefined {
  return records.reduce<QuizRecord | undefined>((a, r) => (!a || r.completedAt > a.completedAt ? r : a), undefined)
}

function best(records: QuizRecord[]): QuizRecord | undefined {
  return records.reduce<QuizRecord | undefined>((a, r) => (!a || r.bestScore / r.total > a.bestScore / a.total ? r : a), undefined)
}

function RecentItems({ ids }: { ids: string[] }) {
  const [items, setItems] = useState<ContentItem[]>([])
  useEffect(() => {
    let cancelled = false
    Promise.all(ids.map((id) => repository.findItem(id).catch(() => null))).then((found) => {
      if (!cancelled) setItems(found.flatMap((f) => (f ? [f.item] : [])))
    })
    return () => {
      cancelled = true
    }
  }, [ids])

  if (items.length === 0) return null
  return (
    <section aria-labelledby="recent-heading" className="mt-8">
      <h2 id="recent-heading" className="text-xl font-bold">
        Địa danh em xem gần đây
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={`/dia-danh/${item.id}`}
              className="inline-flex min-h-11 items-center rounded-full bg-secondary-soft px-4 font-semibold text-secondary hover:brightness-95"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function ProgressPage() {
  const { state, persisted, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)
  const records = Object.values(state.quizzes)
  const last = latest(records)
  const top = best(records)
  const isEmpty = state.viewedItemIds.length === 0 && state.visitedRegionIds.length === 0 && records.length === 0

  return (
    <div>
      <h1 className="text-3xl font-bold">Tiến độ học tập</h1>
      <p className="mt-2 text-muted">Tiến độ chỉ lưu trên trình duyệt này, không đồng bộ sang máy khác.</p>

      {!persisted && (
        <p role="status" className="mt-4 rounded-card bg-accent-soft p-4">
          Trình duyệt đang chặn lưu tiến độ. Kết quả của em sẽ mất khi đóng trang.
        </p>
      )}

      {isEmpty ? (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-card bg-surface p-10 text-center shadow-sm">
          <Star aria-hidden className="size-12 text-accent" />
          <p className="text-xl font-semibold">Em chưa bắt đầu khám phá</p>
          <Link
            to="/ban-do"
            className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-semibold text-white hover:bg-primary-dark"
          >
            Khám phá bản đồ
          </Link>
        </div>
      ) : (
        <>
          <ul aria-label="Thống kê" className={`${GRID.xs} mt-6 gap-4`}>
            <Stat icon={Map} label="Vùng đã khám phá" value={String(state.visitedRegionIds.length)} />
            <Stat icon={Eye} label="Địa danh đã xem" value={String(state.viewedItemIds.length)} />
            <Stat icon={BookOpenCheck} label="Bài đã hoàn thành" value={String(records.length)} />
            <Stat icon={Star} label="Điểm gần nhất" value={last ? `${last.lastScore}/${last.total}` : '—'} />
            <Stat icon={Trophy} label="Điểm cao nhất" value={top ? `${top.bestScore}/${top.total}` : '—'} />
          </ul>
          <RecentItems ids={state.recentItemIds} />
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 font-semibold hover:bg-accent-soft"
          >
            <Trash2 aria-hidden className="size-5" />
            Xóa tiến độ
          </button>
        </>
      )}

      {confirming && (
        <ConfirmDialog
          title="Xóa toàn bộ tiến độ?"
          description="Các địa danh đã xem và điểm trắc nghiệm trên trình duyệt này sẽ bị xóa."
          confirmLabel="Có, xóa hết"
          cancelLabel="Không, giữ lại"
          onConfirm={() => {
            reset()
            setConfirming(false)
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
