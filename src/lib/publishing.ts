import type { ContentStatus } from '../types/content'

// Quy tắc xuất bản dùng chung cho mọi dữ liệu có trạng thái draft/verified (nội dung, ảnh, hồ sơ tỉnh…)
/** Bản production chỉ hiện nội dung đã được giáo viên duyệt; khi phát triển thì hiện cả bản nháp */
export function isPublished(status: ContentStatus): boolean {
  return import.meta.env.PROD ? status === 'verified' : true
}
