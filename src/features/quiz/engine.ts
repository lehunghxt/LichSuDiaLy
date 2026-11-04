// Chấm điểm trắc nghiệm: hàm thuần, không phụ thuộc UI.
// Thêm dạng câu hỏi mới: thêm nhánh vào union Question/Answer và một case ở isCorrect.
import type { Question } from '../../types/quiz'

export type Answer =
  | { type: 'single_choice'; index: number }
  | { type: 'true_false'; value: boolean }
  | { type: 'map_locate'; itemId: string }
  /** leftIndex → rightIndex (chỉ số theo thứ tự gốc trong pairs) */
  | { type: 'matching'; pairs: Record<number, number> }

/** Nhãn các điểm ứng viên của câu hỏi bản đồ, theo thứ tự candidateItemIds */
export const POINT_LETTERS = 'ABCDEFGH'

export function isCorrect(q: Question, a: Answer): boolean {
  switch (q.type) {
    case 'single_choice':
      return a.type === q.type && a.index === q.answerIndex
    case 'true_false':
      return a.type === q.type && a.value === q.answer
    case 'map_locate':
      return a.type === q.type && a.itemId === q.targetItemId
    case 'matching':
      return a.type === q.type && q.pairs.every((_, i) => a.pairs[i] === i)
  }
}

export function score(questions: Question[], answers: (Answer | undefined)[]): { correct: number; total: number } {
  const correct = questions.filter((q, i) => {
    const a = answers[i]
    return a !== undefined && isCorrect(q, a)
  }).length
  return { correct, total: questions.length }
}

/** Fisher–Yates, không đổi mảng gốc */
export function shuffle<T>(xs: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}
