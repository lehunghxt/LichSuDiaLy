import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { safeGet, safeRemove, safeSet } from '../../lib/storage'
import * as P from './progress'
import { ProgressContext, type ProgressContextValue } from './progressContext'

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => P.parseProgress(safeGet(P.PROGRESS_KEY)))
  const [persisted, setPersisted] = useState(true)
  const lastSaved = useRef(state)

  // Thử ghi một lần khi khởi động để biết trình duyệt có cho lưu không
  useEffect(() => {
    setPersisted(safeSet(P.PROGRESS_KEY, JSON.stringify(lastSaved.current)))
  }, [])

  useEffect(() => {
    if (state === lastSaved.current) return
    lastSaved.current = state
    if (state === P.INITIAL_PROGRESS) safeRemove(P.PROGRESS_KEY)
    else setPersisted(safeSet(P.PROGRESS_KEY, JSON.stringify(state)))
  }, [state])

  // Các hàm ghi tiến độ chỉ gọi setState(s => …), không đọc state: tạo một lần, giữ nguyên danh tính.
  // Nhờ vậy effect của trang nhận chúng làm phụ thuộc (MapPage, QuizPage) không chạy lại sau mỗi lần ghi tiến độ
  const actions = useMemo<Omit<ProgressContextValue, 'state' | 'persisted'>>(
    () => ({
      markRegionVisited: (id) => setState((s) => P.markRegionVisited(s, id)),
      markItemViewed: (id) => setState((s) => P.markItemViewed(s, id)),
      markItemsViewed: (ids) => setState((s) => P.markItemsViewed(s, ids)),
      recordQuiz: (id, score, total) => setState((s) => P.recordQuiz(s, id, score, total, new Date())),
      reset: () => setState(P.INITIAL_PROGRESS),
    }),
    [],
  )
  const value = useMemo<ProgressContextValue>(() => ({ state, persisted, ...actions }), [state, persisted, actions])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
