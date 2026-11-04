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

/** Các phần trong dàn ý vùng (doc.md); "lich-su" giữ theo bài lịch sử của SGK */
export const SECTIONS = ['thien-nhien', 'dan-cu-san-xuat', 'van-hoa', 'lich-su'] as const
export type SectionId = (typeof SECTIONS)[number]

export const SECTION_LABELS: Record<SectionId, string> = {
  'thien-nhien': 'Thiên nhiên',
  'dan-cu-san-xuat': 'Dân cư và hoạt động sản xuất',
  'van-hoa': 'Văn hóa',
  'lich-su': 'Lịch sử và di tích',
}

/** Một mục trong dàn ý; nội dung là các ContentItem theo thứ tự itemIds (rỗng = đang cập nhật) */
export interface OutlineTopic {
  id: string
  title: string
  /** Phần trong ngoặc của doc.md, ví dụ "(sông Hồng, sông Đà, sông Lô)" */
  hint?: string
  itemIds: string[]
}

export interface OutlineSection {
  id: SectionId
  topics: OutlineTopic[]
}

export interface RegionOutline {
  regionId: string
  sections: OutlineSection[]
}

export type ContentStatus = 'draft' | 'verified'

export interface SourceRef {
  title: string
  url?: string
  /** Ví dụ: "tr. 15" */
  note?: string
  /** Trang sách (số in trên trang) để mở đúng trang trong trình đọc SGK */
  page?: number
}

/** Hình trong SGK (ảnh, lược đồ, sơ đồ): chỉ ghi chú thích và trang, không sao chép hình */
export interface SgkFigure {
  /** Số bài, ví dụ 4 cho "Bài 4" (số hình đánh lại từ 1 ở mỗi bài) */
  lesson: number
  figure: number
  page: number
  caption: string
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
  /** Hình minh hoạ tương ứng trong SGK */
  figures?: SgkFigure[]
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

/** Ảnh nhúng từ Wikimedia Commons (không lưu file trong repo); ghi nguồn theo TASL */
export interface WebImage {
  /** "<provinceId|_toan-vung>__<slug>", duy nhất toàn site */
  id: string
  provider: 'wikimedia-commons'
  /** Gắn từ thư mục chứa file, không ghi trong JSON */
  regionId: string
  /** null = ảnh của cả vùng (_toan-vung.json) */
  provinceId: string | null
  category: TopicCategory
  itemIds: string[]
  alt: string
  caption: string
  src: { url: string; width: number; height: number; srcset: { url: string; width: number }[] }
  attribution: { title: string; author: string; authorUrl?: string; license: string; licenseUrl?: string; sourceUrl: string }
  status: ContentStatus
}
