import type { Quiz } from './quiz'

export const TOPIC_CATEGORIES = ['natural', 'culture', 'mineral', 'landmark', 'historical_site'] as const
export type TopicCategory = (typeof TOPIC_CATEGORIES)[number]

export const TOPIC_LABELS: Record<TopicCategory, string> = {
  natural: 'Đặc điểm tự nhiên',
  culture: 'Lễ hội và văn hóa',
  mineral: 'Khoáng sản',
  landmark: 'Danh lam thắng cảnh',
  historical_site: 'Di tích lịch sử',
}

export type ContentStatus = 'draft' | 'verified'

export interface SourceRef {
  title: string
  url?: string
  /** Ví dụ: "tr. 15" */
  note?: string
}

export interface ImageRef {
  imageId: string
  alt: string
  credit: string
  license: string
  sourceUrl?: string
}

export interface MediaRef {
  src: string
  credit: string
  license: string
}

export interface RegionMeta {
  id: string
  name: string
  shortName: string
  /** Tên token màu trong styles/index.css, ví dụ "region-tdmnbb" */
  color: string
  status: 'active' | 'coming_soon'
}

export interface ItemLocation {
  lat: number
  lng: number
  placeName: string
}

export interface ContentItem {
  id: string
  regionId: string
  category: TopicCategory
  title: string
  summary: string
  highlights: string[]
  keyPoints: string[]
  funFacts?: string[]
  location?: ItemLocation
  provinceId?: string
  images: ImageRef[]
  audio?: MediaRef
  relatedIds: string[]
  sources: SourceRef[]
  status: ContentStatus
}

export interface RegionContent {
  region: RegionMeta
  intro: string
  items: ContentItem[]
  quizzes: Quiz[]
}
