import { BookOpenCheck, Eye, Map, Star, Trash2, Trophy, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { repository } from '../../features/content'
import { type QuizRecord, useProgress } from '../../features/progress'
import type { ContentItem } from '../../types/content'
import { GRID_FILL_XS } from '../../components/ui/grid'

interface StatProps {
  icon: LucideIcon
  label: string
  /** Con số chính; null là chưa có (chưa làm bài nào) */
  value: number | null
  /** Tổng để so, viết nhỏ sau con số ("/4"); có tổng thì có thêm thanh tiến độ */
  total?: number
}

/** Ô số liệu xếp dọc: biểu tượng, con số lớn, nhãn. Nhãn có cả bề ngang ô nên không bị bóp xuống nhiều dòng */
function Stat({ icon: Icon, label, value, total }: StatProps) {
  const percent = value !== null && total ? Math.round((value / total) * 100) : null
  return (
    <li className="flex flex-col gap-2 rounded-card bg-surface p-5 shadow-sm">
      <span className="mb-1 grid size-11 place-items-center rounded-2xl bg-primary-soft">
        <Icon aria-hidden className="size-6 text-primary" />
      </span>
      {value === null ? (
        <span className="text-xl font-bold leading-9 text-muted">Chưa có</span>
      ) : (
        <span className="text-3xl font-extrabold leading-9">
          {value}
          {total !== undefined && <span className="text-lg font-bold text-muted">/{total}</span>}
        </span>
      )}
      <p className="text-sm font-semibold leading-snug text-muted">{label}</p>
      {percent !== null && (
        <div
          role="progressbar"
          aria-label={label}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-1 h-2 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary" style={{ width: `${percent}%` }} />
        </div>
      )}
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
          <ul aria-label="Thống kê" className={`${GRID_FILL_XS} mt-6 gap-4`}>
            <Stat icon={Map} label="Vùng đã khám phá" value={state.visitedRegionIds.length} total={repository.getRegions().length} />
            <Stat icon={Eye} label="Địa danh đã xem" value={state.viewedItemIds.length} />
            <Stat icon={BookOpenCheck} label="Bài đã hoàn thành" value={records.length} />
            <Stat icon={Star} label="Điểm gần nhất" value={last?.lastScore ?? null} total={last?.total} />
            <Stat icon={Trophy} label="Điểm cao nhất" value={top?.bestScore ?? null} total={top?.total} />
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
