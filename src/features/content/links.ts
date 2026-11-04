import type { SectionId } from '../../types/content'

/** Phần sau "__" của id mục, dùng trong URL: "trung-du-mien-nui-phia-bac__den-hung" → "den-hung" */
export const itemSlug = (id: string) => id.split('__')[1] ?? id

/**
 * Tham số URL của modal dàn ý: /ban-do/<vùng>?phan=<phần>&muc=<mục dàn ý>&bai=<slug nội dung>
 * (link cũ ?chu-de=<chủ đề>&muc=<slug> vẫn mở được, xem legacyTarget)
 */
export function topicSearch(section: SectionId, topicId: string | null, slug?: string | null) {
  const params = new URLSearchParams({ phan: section })
  if (topicId) params.set('muc', topicId)
  if (topicId && slug) params.set('bai', slug)
  return `?${params.toString()}`
}
