import type { TopicCategory } from '../../types/content'

/** Phần sau "__" của id mục, dùng trong URL: "trung-du-mien-nui-phia-bac__den-hung" → "den-hung" */
export const itemSlug = (id: string) => id.split('__')[1] ?? id

/** Tham số URL của modal chủ đề: /ban-do/<vùng>?chu-de=<chủ đề>&muc=<slug mục> */
export function topicSearch(category: TopicCategory, slug: string | null) {
  return slug ? `?chu-de=${category}&muc=${slug}` : `?chu-de=${category}`
}
