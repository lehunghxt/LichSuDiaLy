import { useCallback } from 'react'
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

  if (state.status === 'loading') return <LoadingState label="Đang tải bài ôn tập…" />
  if (state.status === 'error') {
    return <ErrorState title="Chưa tải được bài ôn tập" onRetry={() => window.location.reload()} action={backLink} />
  }
  if (state.status === 'not_found') {
    return <EmptyState title="Không tìm thấy bài ôn tập" description="Bài này có thể chưa có hoặc đường dẫn bị sai." action={backLink} />
  }

  const { quiz, content } = state
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-semibold text-secondary">{content.region.name}</p>
      <h1 className="text-3xl font-bold">{quiz.title}</h1>
      <div className="mt-6">
        {quiz.questions.length === 0 ? (
          <EmptyState title="Bài ôn tập đang được chuẩn bị" description="Câu hỏi đang được thầy cô kiểm tra." action={backLink} />
        ) : (
          <QuizRunner key={quiz.id} quiz={quiz} onComplete={onComplete} />
        )}
      </div>
    </div>
  )
}
