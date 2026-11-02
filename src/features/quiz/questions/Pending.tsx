import type { Question } from '../../../types/quiz'
import type { QuestionViewProps } from '../registry'

/** Tạm thời cho dạng "Xác định trên bản đồ" và "Ghép đôi" cho tới Task 10 */
export function Pending(_props: QuestionViewProps<Question>) {
  return <p className="rounded-2xl bg-accent-soft p-4">Dạng câu hỏi này đang được hoàn thiện.</p>
}
