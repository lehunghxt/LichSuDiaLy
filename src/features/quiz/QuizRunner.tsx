import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Search, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Quiz } from '../../types/quiz'
import { isCorrect, score, type Answer } from './engine'
import { correctAnswerLabel, QuestionView } from './registry'

const CORRECT_TEXT = 'Chính xác! Em đã trả lời đúng.'
const WRONG_TEXT = 'Em hãy cùng tìm hiểu lại nội dung này nhé!'

interface QuizRunnerProps {
  quiz: Quiz
  onComplete(correct: number, total: number): void
}

type Phase = 'answering' | 'result' | 'review'

export function QuizRunner({ quiz, onComplete }: QuizRunnerProps) {
  const { questions } = quiz
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(Answer | undefined)[]>([])
  const [phase, setPhase] = useState<Phase>('answering')
  // Tăng mỗi lần chơi lại để các câu hỏi có state riêng (ví dụ Ghép đôi) được tạo mới
  const [round, setRound] = useState(0)
  const reported = useRef(false)

  const result = score(questions, answers)

  useEffect(() => {
    if (phase === 'result' && !reported.current) {
      reported.current = true
      onComplete(result.correct, result.total)
    }
  }, [phase, result.correct, result.total, onComplete])

  const restart = () => {
    setIndex(0)
    setAnswers([])
    setPhase('answering')
    setRound((n) => n + 1)
    reported.current = false
  }

  if (phase !== 'answering') {
    const wrong = questions.filter((q, i) => {
      const a = answers[i]
      return !a || !isCorrect(q, a)
    })
    return (
      <section className="rounded-card bg-surface p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Trophy aria-hidden className="size-14 text-accent" />
          <h2 className="text-2xl font-bold">
            Em đúng {result.correct}/{result.total} câu
          </h2>
          <p className="text-muted">
            {wrong.length === 0 ? 'Tuyệt vời! Em đã trả lời đúng tất cả các câu.' : 'Em làm tốt lắm! Cùng ôn lại vài câu nhé.'}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-white hover:bg-primary-dark"
            >
              <RotateCcw aria-hidden className="size-5" />
              Chơi lại
            </button>
            {wrong.length > 0 && phase === 'result' && (
              <button
                type="button"
                onClick={() => setPhase('review')}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-primary px-6 font-semibold text-primary hover:bg-primary-soft"
              >
                <Search aria-hidden className="size-5" />
                Xem lại câu sai
              </button>
            )}
          </div>
        </div>

        {phase === 'review' && (
          <ul aria-label="Các câu cần xem lại" className="mt-8 flex flex-col gap-4">
            {wrong.map((q) => (
              <li key={q.id} className="rounded-2xl border border-line p-5">
                <p className="font-semibold">{q.prompt}</p>
                <p className="mt-2 text-secondary">Đáp án đúng: {correctAnswerLabel(q)}</p>
                <p className="mt-1 text-muted">{q.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  const question = questions[index]
  if (!question) return null
  const answer = answers[index]
  const locked = answer !== undefined
  const correct = answer !== undefined && isCorrect(question, answer)
  const isLast = index === questions.length - 1

  return (
    <section className="@container rounded-card bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-primary">
          Câu {index + 1}/{questions.length}
        </p>
        <div
          role="progressbar"
          aria-label="Tiến độ bài làm"
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-valuenow={index + 1}
          className="h-3 w-48 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full bg-primary transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <h2 className="mt-4 text-xl font-bold @2xl:text-2xl">{question.prompt}</h2>

      <div className="mt-6">
        <QuestionView
          key={`${round}-${question.id}`}
          question={question}
          answer={answer}
          locked={locked}
          onAnswer={(a) => setAnswers((prev) => Object.assign([...prev], { [index]: a }))}
        />
      </div>

      <div aria-live="polite" data-testid="feedback" className="mt-6">
        {locked && (
          <div className={`flex gap-3 rounded-2xl p-5 ${correct ? 'bg-secondary-soft' : 'bg-accent-soft'}`}>
            {correct ? (
              <CheckCircle2 aria-hidden className="size-7 shrink-0 text-secondary" />
            ) : (
              <Lightbulb aria-hidden className="size-7 shrink-0 text-accent" />
            )}
            <div>
              <p className="font-bold">{correct ? CORRECT_TEXT : WRONG_TEXT}</p>
              {!correct && <p className="mt-1">Đáp án đúng: {correctAnswerLabel(question)}</p>}
              <p className="mt-1 text-muted">{question.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {locked && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => (isLast ? setPhase('result') : setIndex(index + 1))}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-white hover:bg-primary-dark"
          >
            {isLast ? 'Xem kết quả' : 'Câu tiếp theo'}
            <ArrowRight aria-hidden className="size-5" />
          </button>
        </div>
      )}
    </section>
  )
}
