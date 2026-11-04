import { createContext } from 'react'
import type { ProgressState } from './progress'

export interface ProgressContextValue {
  state: ProgressState
  /** false khi trình duyệt chặn localStorage: tiến độ chỉ giữ tới khi đóng trang */
  persisted: boolean
  markRegionVisited(regionId: string): void
  markItemViewed(itemId: string): void
  markItemsViewed(itemIds: string[]): void
  recordQuiz(quizId: string, score: number, total: number): void
  reset(): void
}

export const ProgressContext = createContext<ProgressContextValue | null>(null)
