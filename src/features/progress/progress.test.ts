import { parseRegionContent } from '../content/parse'
import { rawRegionContent } from '../../test/fixtures'
import {
  INITIAL_PROGRESS,
  markItemViewed,
  markRegionVisited,
  parseProgress,
  recordQuiz,
  regionCompletion,
} from './progress'
import { safeGet, safeRemove, safeSet } from '../../lib/storage'

test('parseProgress(null) and parseProgress("{bad") return INITIAL_PROGRESS', () => {
  expect(parseProgress(null)).toEqual(INITIAL_PROGRESS)
  expect(parseProgress('{bad')).toEqual(INITIAL_PROGRESS)
})

test('parseProgress with version 2 returns INITIAL_PROGRESS', () => {
  expect(parseProgress(JSON.stringify({ ...INITIAL_PROGRESS, version: 2 }))).toEqual(INITIAL_PROGRESS)
})

test('parseProgress drops malformed fields but keeps valid ones', () => {
  const raw = JSON.stringify({
    version: 1,
    visitedRegionIds: ['a', 5],
    viewedItemIds: 'oops',
    recentItemIds: ['x'],
    quizzes: { q: { lastScore: 3, bestScore: 4, total: 5, attempts: 2, completedAt: '2026-11-02T00:00:00.000Z' }, bad: 1 },
  })
  const p = parseProgress(raw)
  expect(p.visitedRegionIds).toEqual(['a'])
  expect(p.viewedItemIds).toEqual([])
  expect(Object.keys(p.quizzes)).toEqual(['q'])
})

test('markItemViewed twice returns same reference (no redundant write)', () => {
  const once = markItemViewed(INITIAL_PROGRESS, 'i1')
  expect(once.viewedItemIds).toEqual(['i1'])
  expect(markItemViewed(once, 'i1')).toBe(once)
})

test('markItemViewed keeps 6 most recent, newest first', () => {
  let s = INITIAL_PROGRESS
  for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) s = markItemViewed(s, id)
  expect(s.recentItemIds).toEqual(['g', 'f', 'e', 'd', 'c', 'b'])
  s = markItemViewed(s, 'c')
  expect(s.recentItemIds).toEqual(['c', 'g', 'f', 'e', 'd', 'b'])
  expect(s.viewedItemIds).toHaveLength(7)
})

test('markRegionVisited is idempotent', () => {
  const s = markRegionVisited(INITIAL_PROGRESS, 'r')
  expect(markRegionVisited(s, 'r')).toBe(s)
})

test('recordQuiz keeps bestScore = max, increments attempts', () => {
  const t1 = new Date('2026-11-01T10:00:00Z')
  const t2 = new Date('2026-11-02T10:00:00Z')
  let s = recordQuiz(INITIAL_PROGRESS, 'q', 7, 8, t1)
  s = recordQuiz(s, 'q', 5, 8, t2)
  expect(s.quizzes.q).toEqual({ lastScore: 5, bestScore: 7, total: 8, attempts: 2, completedAt: t2.toISOString() })
})

test('regionCompletion ignores draft items and handles 0 denominator', () => {
  vi.stubEnv('PROD', true)
  const content = parseRegionContent(rawRegionContent())
  // fixture: 1 mục verified + 1 draft; 1 quiz
  let s = markItemViewed(INITIAL_PROGRESS, 'vung-a__dia-danh-1')
  s = markItemViewed(s, 'vung-a__khoang-san-1') // draft: không tính
  expect(regionCompletion(s, content)).toBe(50)
  s = recordQuiz(s, 'vung-a__on-tap-1', 1, 1, new Date())
  expect(regionCompletion(s, content)).toBe(100)
  expect(regionCompletion(s, { ...content, items: [], quizzes: [] })).toBe(0)
  vi.unstubAllEnvs()
})

test('safeSet returns false when localStorage.setItem throws', () => {
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('QuotaExceededError')
  })
  expect(safeSet('k', 'v')).toBe(false)
  spy.mockRestore()
  expect(safeSet('k', 'v')).toBe(true)
  expect(safeGet('k')).toBe('v')
  safeRemove('k')
  expect(safeGet('k')).toBeNull()
})

test('safeGet returns null when localStorage access throws', () => {
  const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('SecurityError')
  })
  expect(safeGet('k')).toBeNull()
  spy.mockRestore()
})
