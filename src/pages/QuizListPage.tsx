import { BookOpenCheck, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/states'
import { useProgress } from '../features/progress/useProgress'
import { useQuizList } from '../features/quiz/useQuizzes'

export default function QuizListPage() {
  const { status, quizzes } = useQuizList()
  const { state } = useProgress()

  return (
    <div>
      <h1 className="text-3xl font-bold">Trắc nghiệm</h1>
      <p className="mt-2 text-muted">Chọn một bài để thử tài kiến thức của em nhé!</p>
      <div className="mt-6">
        {status === 'loading' && <LoadingState label="Đang tải bài ôn tập…" />}
        {status === 'error' && <ErrorState title="Chưa tải được bài ôn tập" onRetry={() => window.location.reload()} />}
        {status === 'ready' && quizzes.length === 0 && (
          <EmptyState title="Bài ôn tập đang được chuẩn bị" description="Thầy cô đang soạn câu hỏi, em quay lại sau nhé." />
        )}
        {status === 'ready' && quizzes.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map(({ quiz, regionName }) => {
              const record = state.quizzes[quiz.id]
              return (
                <li key={quiz.id}>
                  <Link
                    to={`/on-tap/${quiz.id}`}
                    className="flex items-center gap-4 rounded-card bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <BookOpenCheck aria-hidden className="size-12 shrink-0 rounded-2xl bg-accent-soft p-2.5 text-accent" />
                    <span className="flex-1">
                      <span className="block text-lg font-bold">{quiz.title}</span>
                      <span className="block text-sm text-muted">
                        {regionName} · {quiz.questions.length} câu
                        {record && ` · Điểm cao nhất ${record.bestScore}/${record.total}`}
                      </span>
                    </span>
                    <ChevronRight aria-hidden className="size-6 text-muted" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
