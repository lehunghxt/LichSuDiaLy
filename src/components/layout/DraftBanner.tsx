import { TriangleAlert } from 'lucide-react'
import { showDrafts } from '../../features/content/repository'

/** Băng rôn cho bản deploy xem thử có hiện nội dung chưa được giáo viên duyệt */
export function DraftBanner() {
  if (!import.meta.env.PROD || !showDrafts()) return null
  return (
    <p role="status" className="flex items-center justify-center gap-2 bg-accent-soft px-4 py-2 text-center text-sm font-semibold text-amber-900">
      <TriangleAlert aria-hidden className="size-4 shrink-0" />
      Bản xem thử: nội dung đang chờ giáo viên duyệt, có thể còn chỉnh sửa.
    </p>
  )
}
