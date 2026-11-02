// Mỗi dạng câu hỏi có một component hiển thị. Thiếu dạng nào thì TypeScript báo lỗi.
import type { ComponentType } from 'react'
import type { Question, QuestionType } from '../../types/quiz'
import type { Answer } from './engine'
import { Matching } from './questions/Matching'
import { Pending } from './questions/Pending'
import { SingleChoice } from './questions/SingleChoice'
import { TrueFalse } from './questions/TrueFalse'

export interface QuestionViewProps<Q extends Question> {
  question: Q
  answer?: Answer
  onAnswer(a: Answer): void
  locked: boolean
}

type Views = { [K in QuestionType]: ComponentType<QuestionViewProps<Extract<Question, { type: K }>>> }

export const questionViews: Views = {
  single_choice: SingleChoice,
  true_false: TrueFalse,
  map_locate: Pending,
  matching: Matching,
}

export function QuestionView(props: QuestionViewProps<Question>) {
  const { question } = props
  switch (question.type) {
    case 'single_choice': {
      const View = questionViews.single_choice
      return <View {...props} question={question} />
    }
    case 'true_false': {
      const View = questionViews.true_false
      return <View {...props} question={question} />
    }
    case 'map_locate': {
      const View = questionViews.map_locate
      return <View {...props} question={question} />
    }
    case 'matching': {
      const View = questionViews.matching
      return <View {...props} question={question} />
    }
  }
}

/** Đáp án đúng dạng chữ, dùng trong phản hồi và màn xem lại */
export function correctAnswerLabel(q: Question): string {
  switch (q.type) {
    case 'single_choice':
      return q.options[q.answerIndex]
    case 'true_false':
      return q.answer ? 'Đúng' : 'Sai'
    case 'map_locate':
      return 'vị trí được đánh dấu trên bản đồ'
    case 'matching':
      return q.pairs.map((p) => `${p.left} – ${p.right}`).join('; ')
  }
}
