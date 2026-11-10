// Từ dữ liệu câu hỏi suy ra các nút cần bấm để trả lời. Dùng chung cho test integration
// (Testing Library) và e2e (Playwright): chỉ là dữ liệu, không phụ thuộc thư viện test nào.
import { POINT_LETTERS } from '../../src/features/quiz/engine'
import type { Question } from '../../src/types/quiz'

export interface Click {
  /** Nhóm chứa nút (aria-label của role="group"), nếu tên nút có thể trùng ở nơi khác */
  group?: 'Cột trái' | 'Cột phải'
  /** Tên nút (khớp chính xác) */
  name: string
}

export function correctClicks(q: Question): Click[] {
  switch (q.type) {
    case 'single_choice':
      return [{ name: q.options[q.answerIndex] }]
    case 'true_false':
      return [{ name: q.answer ? 'Đúng' : 'Sai' }]
    case 'map_locate':
      return [{ name: `Điểm ${POINT_LETTERS[q.candidateItemIds.indexOf(q.targetItemId)]}` }]
    case 'matching':
      return [
        ...q.pairs.flatMap((p): Click[] => [
          { group: 'Cột trái', name: p.left },
          { group: 'Cột phải', name: p.right },
        ]),
        { name: 'Kiểm tra' },
      ]
  }
}

/** Một cách trả lời sai (chỉ hỗ trợ dạng chọn đáp án và Đúng/Sai) */
export function wrongClicks(q: Question): Click[] {
  switch (q.type) {
    case 'single_choice':
      return [{ name: q.options[(q.answerIndex + 1) % 4] as string }]
    case 'true_false':
      return [{ name: q.answer ? 'Sai' : 'Đúng' }]
    default:
      throw new Error(`wrongClicks: chưa hỗ trợ dạng ${q.type}`)
  }
}
