import type { ContentItem } from '../../types/content'

export type Place = Pick<ContentItem, 'id' | 'title' | 'section' | 'location'>

/** Chỉ những mục có toạ độ mới hiện trên bản đồ */
export const placesOf = <T extends Place>(items: T[]): T[] => items.filter((i) => i.location !== undefined)
