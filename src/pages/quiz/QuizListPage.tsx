import { ArrowRight, CircleHelp, RotateCcw, Trophy } from 'lucide-react'
import { Link } from 'react-router'
import { CoverImage } from '../../components/ui/CoverImage'
import { GRID_FILL } from '../../components/ui/grid'
import { ImageCredit } from '../../components/ui/ImageCredit'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useRegionCovers } from '../../features/images'
import { type QuizRecord, useProgress } from '../../features/progress'
import { useQuizList } from '../../features/quiz'
import type { RegionMeta, WebImage } from '../../types/content'
import type { Quiz } from '../../types/quiz'

export default function QuizListPage() {
  const { status, quizzes } = useQuizList()
  const { state } = useProgress()
  const covers = useRegionCovers([...new Set(quizzes.map((q) => q.region.id))])

  return (
    <div>
      <h1 className="text-3xl font-bold">Trắc nghiệm</h1>
      <p className="mt-2 text-muted">Chọn một bài để thử tài kiến thức của em nhé!</p>
      <div className="mt-6">
        {status === 'loading' && <LoadingState label="Đang tải bài trắc nghiệm…" />}
        {status === 'error' && <ErrorState title="Chưa tải được bài trắc nghiệm" onRetry={() => window.location.reload()} />}
        {status === 'ready' && quizzes.length === 0 && (
          <EmptyState title="Bài trắc nghiệm đang được chuẩn bị" description="Thầy cô đang soạn câu hỏi, em quay lại sau nhé." />
        )}
        {status === 'ready' && quizzes.length > 0 && (
          <ul aria-label="Các bài trắc nghiệm" className={`${GRID_FILL.md} gap-5`}>
            {quizzes.map(({ quiz, region }) => (
              <QuizCard key={quiz.id} quiz={quiz} region={region} record={state.quizzes[quiz.id]} cover={covers[region.id]} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

interface QuizCardProps {
  quiz: Quiz
  region: RegionMeta
  /** Kết quả các lần làm trước; không có là chưa làm */
  record: QuizRecord | undefined
  cover: WebImage | undefined
}

/** Một bài ôn tập: ảnh vùng, số câu, tên bài, kết quả (hoặc "Chưa làm") và nút bắt đầu/làm lại ở đáy thẻ */
function QuizCard({ quiz, region, record, cover }: QuizCardProps) {
  const percent = record ? Math.round((record.bestScore / record.total) * 100) : 0
  return (
    <li className="flex flex-col rounded-card bg-surface shadow-[0_8px_30px_rgb(15_23_42/0.08)] transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/on-tap/${quiz.id}`} className="flex flex-1 flex-col rounded-card">
        {/* Ảnh tiêu biểu của vùng; dải màu của vùng làm nền khi ảnh đang tải hoặc không có ảnh */}
        <span
          className="relative block h-32 overflow-hidden rounded-t-card"
          style={{ background: `linear-gradient(135deg, var(--color-${region.color}), #ffffff)` }}
        >
          {cover && <CoverImage image={cover} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" />}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-ink shadow-sm">
            <CircleHelp aria-hidden className="size-4 text-primary" />
            {quiz.questions.length} câu
          </span>
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: `var(--color-${region.color})` }} />
        </span>
        <span className="flex flex-1 flex-col gap-3 p-5">
          {!quiz.title.includes(region.name) && <span className="text-sm font-semibold text-muted">{region.name}</span>}
          <span className="text-balance text-lg font-bold leading-snug">{quiz.title}</span>
          {record ? (
            <span className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Trophy aria-hidden className="size-4 text-accent" />
                Điểm cao nhất {record.bestScore}/{record.total}
              </span>
              <span
                role="progressbar"
                aria-label="Điểm cao nhất"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="block h-2 overflow-hidden rounded-full bg-line"
              >
                <span className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary" style={{ width: `${percent}%` }} />
              </span>
            </span>
          ) : (
            <span className="text-sm text-muted">Chưa làm</span>
          )}
          <span
            className={`mt-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-5 font-bold ${
              record ? 'border-2 border-primary/20 text-primary' : 'bg-primary text-white shadow-md shadow-primary/30'
            }`}
          >
            {record ? <RotateCcw aria-hidden className="size-4" /> : null}
            {record ? 'Làm lại' : 'Bắt đầu'}
            <ArrowRight aria-hidden className="size-4" />
          </span>
        </span>
      </Link>
      {/* Ghi nguồn ảnh Commons (TASL), nằm ngoài link của thẻ vì có link riêng; luôn cao đủ hai dòng để nút của các thẻ cùng hàng thẳng nhau */}
      {cover && (
        <p className="-mt-2 line-clamp-2 min-h-[calc(2lh+1rem)] px-5 pb-4 text-xs leading-tight">
          <ImageCredit image={cover} />
        </p>
      )}
    </li>
  )
}
