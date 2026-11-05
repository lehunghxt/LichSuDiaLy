import profiles from '../../data/province-profiles.json'
import type { ContentStatus, SourceRef } from '../../types/content'
import { isPublished } from '../content/repository'

export interface ProvinceFact {
  text: string
  source: SourceRef
}

/** Thông tin thêm về tỉnh lấy ngoài SGK (mỗi ý một nguồn); theo quy tắc xuất bản như nội dung bài học */
export function provinceFacts(provinceId: string): ProvinceFact[] {
  const profile = profiles.find((p) => p.provinceId === provinceId)
  return profile && isPublished(profile.status as ContentStatus) ? profile.facts : []
}
