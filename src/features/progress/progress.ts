// Mô hình tiến độ học tập và các hàm cập nhật thuần (không đụng tới localStorage).
// Hàm cập nhật trả về đúng object cũ khi không có gì thay đổi, để tránh ghi thừa.
import type { RegionContent } from '../../types/content'
import { isPublished } from '../content/repository'

export const PROGRESS_KEY = 'ekp-progress-v1'
const RECENT_LIMIT = 6

export interface QuizRecord {
  lastScore: number
  bestScore: number
  total: number
  attempts: number
  /** ISO 8601 */
  completedAt: string
}

export interface ProgressState {
  version: 1
  visitedRegionIds: string[]
  viewedItemIds: string[]
  recentItemIds: string[]
  quizzes: Record<string, QuizRecord>
}

export const INITIAL_PROGRESS: ProgressState = {
  version: 1,
  visitedRegionIds: [],
  viewedItemIds: [],
  recentItemIds: [],
  quizzes: {},
}

function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function isQuizRecord(v: unknown): v is QuizRecord {
  if (typeof v !== 'object' || v === null) return false
  if (!('lastScore' in v && 'bestScore' in v && 'total' in v && 'attempts' in v && 'completedAt' in v)) return false
  return (
    typeof v.lastScore === 'number' &&
    typeof v.bestScore === 'number' &&
    typeof v.total === 'number' &&
    typeof v.attempts === 'number' &&
    typeof v.completedAt === 'string'
  )
}

export function parseProgress(raw: string | null): ProgressState {
  if (raw === null) return INITIAL_PROGRESS
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return INITIAL_PROGRESS
  }
  if (typeof data !== 'object' || data === null || !('version' in data) || data.version !== 1) {
    return INITIAL_PROGRESS
  }
  const quizzes: Record<string, QuizRecord> = {}
  if ('quizzes' in data && typeof data.quizzes === 'object' && data.quizzes !== null) {
    for (const [id, rec] of Object.entries(data.quizzes)) if (isQuizRecord(rec)) quizzes[id] = rec
  }
  return {
    version: 1,
    visitedRegionIds: strings('visitedRegionIds' in data ? data.visitedRegionIds : undefined),
    viewedItemIds: strings('viewedItemIds' in data ? data.viewedItemIds : undefined),
    recentItemIds: strings('recentItemIds' in data ? data.recentItemIds : undefined).slice(0, RECENT_LIMIT),
    quizzes,
  }
}

export function markRegionVisited(s: ProgressState, regionId: string): ProgressState {
  return s.visitedRegionIds.includes(regionId) ? s : { ...s, visitedRegionIds: [...s.visitedRegionIds, regionId] }
}

export function markItemViewed(s: ProgressState, itemId: string): ProgressState {
  const viewed = s.viewedItemIds.includes(itemId)
  if (viewed && s.recentItemIds[0] === itemId) return s
  return {
    ...s,
    viewedItemIds: viewed ? s.viewedItemIds : [...s.viewedItemIds, itemId],
    recentItemIds: [itemId, ...s.recentItemIds.filter((id) => id !== itemId)].slice(0, RECENT_LIMIT),
  }
}

export function recordQuiz(s: ProgressState, quizId: string, score: number, total: number, now: Date): ProgressState {
  const prev = s.quizzes[quizId]
  return {
    ...s,
    quizzes: {
      ...s.quizzes,
      [quizId]: {
        lastScore: score,
        bestScore: Math.max(score, prev?.bestScore ?? 0),
        total,
        attempts: (prev?.attempts ?? 0) + 1,
        completedAt: now.toISOString(),
      },
    },
  }
}

/** % hoàn thành = (mục đã xem + bài đã làm) / (tổng mục + tổng bài), chỉ tính nội dung đã xuất bản */
export function regionCompletion(s: ProgressState, content: RegionContent): number {
  const items = content.items.filter((i) => isPublished(i.status))
  const quizzes = content.quizzes.filter((q) => q.questions.some((x) => isPublished(x.status)))
  const total = items.length + quizzes.length
  if (total === 0) return 0
  const done =
    items.filter((i) => s.viewedItemIds.includes(i.id)).length + quizzes.filter((q) => s.quizzes[q.id]).length
  return Math.round((100 * done) / total)
}
