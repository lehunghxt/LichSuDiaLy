import type { ContentStatus, SourceRef } from './content'

interface QuestionBase {
  id: string
  prompt: string
  explanation: string
  sources: SourceRef[]
  status: ContentStatus
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single_choice'
  options: [string, string, string, string]
  answerIndex: 0 | 1 | 2 | 3
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true_false'
  answer: boolean
}

/** Chọn đúng marker của địa danh (có tọa độ đã kiểm chứng) trong số các ứng viên */
export interface MapLocateQuestion extends QuestionBase {
  type: 'map_locate'
  targetItemId: string
  candidateItemIds: string[]
}

export interface MatchingQuestion extends QuestionBase {
  type: 'matching'
  pairs: { left: string; right: string }[]
}

export type Question = SingleChoiceQuestion | TrueFalseQuestion | MapLocateQuestion | MatchingQuestion
export type QuestionType = Question['type']

export interface Quiz {
  id: string
  regionId: string
  title: string
  questions: Question[]
}
