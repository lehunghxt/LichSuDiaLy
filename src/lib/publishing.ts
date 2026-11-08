import type { ContentStatus } from '../types/content'

// Quy tắc xuất bản dùng chung cho mọi dữ liệu có trạng thái draft/verified (nội dung, ảnh, hồ sơ tỉnh…)
/** Bản production chỉ hiện nội dung đã được giáo viên duyệt */
/** Bản xem thử: build PROD vẫn hiện nội dung nháp khi đặt VITE_SHOW_DRAFTS=true */
export function showDrafts(): boolean {
  return import.meta.env.VITE_SHOW_DRAFTS === 'true'
}

export function isPublished(status: ContentStatus): boolean {
  return import.meta.env.PROD && !showDrafts() ? status === 'verified' : true
}
