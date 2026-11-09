import type { SectionId } from './content'

/** Số liệu Trang chủ, sinh lúc build từ nội dung đã xuất bản (scripts/lib/home-summary.mjs) */
export interface HomeSummary {
  regions: RegionSummary[]
}

export interface RegionSummary {
  id: string
  /** Mục nội dung đã xuất bản: đếm tiến độ và hiện tên mục "Tiếp tục" */
  items: { id: string; title: string }[]
  /** Số câu hỏi đã xuất bản trong mọi bài trắc nghiệm của vùng */
  questions: number
  funFacts: { fact: string; itemId: string }[]
  /** Các phần của dàn ý: số mục, số mục đã có nội dung */
  sections: { id: SectionId; topics: number; filled: number }[]
}
