import { useCallback } from 'react'
import { ArrowLeft, Map as MapIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useProgress } from '../../features/progress'
import { QuizRunner, useQuiz } from '../../features/quiz'

const backLink = (
  <Link to="/on-tap" className="font-semibold text-primary underline">
    Về danh sách bài
  </Link>
)

export default function QuizPage() {
  const { quizId } = useParams()
  const state = useQuiz(quizId)
  const { recordQuiz } = useProgress()
  const onComplete = useCallback(
    (correct: number, total: number) => {
      if (quizId) recordQuiz(quizId, correct, total)
    },
    [quizId, recordQuiz],
  )

  if (state.status === 'loading') return <LoadingState label="Đang tải bài trắc nghiệm…" />
  if (state.status === 'error') {
    return <ErrorState title="Chưa tải được bài trắc nghiệm" onRetry={() => window.location.reload()} action={backLink} />
  }
  if (state.status === 'not_found') {
    return <EmptyState title="Không tìm thấy bài trắc nghiệm" description="Bài này có thể chưa có hoặc đường dẫn bị sai." action={backLink} />
  }

  const { quiz, content } = state
  return (
    <div className="mx-auto max-w-4xl">
      {/* Lối thoát giữa bài: về danh sách, không cần làm hết các câu */}
      <Link
        to="/on-tap"
        className="-ml-3 mb-2 inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:bg-surface hover:text-ink"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Các bài trắc nghiệm
      </Link>
      <p className="text-sm font-semibold text-secondary">{content.region.name}</p>
      <h1 className="text-3xl font-bold">{quiz.title}</h1>
      <div className="mt-6">
        {quiz.questions.length === 0 ? (
          <EmptyState title="Bài trắc nghiệm đang được chuẩn bị" description="Câu hỏi đang được thầy cô kiểm tra." action={backLink} />
        ) : (
          <QuizRunner
            key={quiz.id}
            quiz={quiz}
            onComplete={onComplete}
            reviewAction={
              <Link
                to={`/ban-do/${content.region.id}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-line px-6 font-semibold text-ink hover:border-primary hover:text-primary"
              >
                <MapIcon aria-hidden className="size-5" />
                Ôn lại trên bản đồ
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
