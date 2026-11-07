import { useEffect, useState } from 'react'
import type { RegionContent } from '../../types/content'
import type { Quiz } from '../../types/quiz'
import { repository } from '../content/repository'

export type QuizState =
  { status: 'loading' } | { status: 'ready'; quiz: Quiz; content: RegionContent } | { status: 'not_found' } | { status: 'error' }

export function useQuiz(quizId: string | undefined): QuizState {
  const [state, setState] = useState<QuizState>({ status: 'loading' })
  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    ;(quizId ? repository.findQuiz(quizId) : Promise.resolve(null)).then(
      (found) => !cancelled && setState(found ? { status: 'ready', ...found } : { status: 'not_found' }),
      () => !cancelled && setState({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [quizId])
  return state
}

export interface QuizSummary {
  quiz: Quiz
  regionName: string
}

/** Các bài ôn tập (có ít nhất 1 câu đã xuất bản) của mọi vùng đang mở */
export function useQuizList(): { status: 'loading' | 'ready' | 'error'; quizzes: QuizSummary[] } {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; quizzes: QuizSummary[] }>({
    status: 'loading',
    quizzes: [],
  })
  useEffect(() => {
    let cancelled = false
    const regions = repository.getRegions().filter((r) => r.status === 'active')
    Promise.all(regions.map((r) => repository.loadRegionContent(r.id))).then(
      (contents) => {
        if (cancelled) return
        const quizzes = contents.flatMap((c) =>
          c ? c.quizzes.filter((q) => q.questions.length > 0).map((quiz) => ({ quiz, regionName: c.region.name })) : [],
        )
        setState({ status: 'ready', quizzes })
      },
      () => !cancelled && setState({ status: 'error', quizzes: [] }),
    )
    return () => {
      cancelled = true
    }
  }, [])
  return state
}
