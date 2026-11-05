import provinces from '../../data/provinces.json'
import type { ContentItem } from '../../types/content'

export interface ProvinceMention {
  item: ContentItem
  sentences: string[]
}

// Dữ liệu tỉnh viết dấu kiểu cũ (Hòa), SGK viết kiểu mới (Hoà): đưa cả hai về kiểu mới trước khi so
const TONE: [string, string][] = [
  ['óa', 'oá'],
  ['òa', 'oà'],
  ['ỏa', 'oả'],
  ['õa', 'oã'],
  ['ọa', 'oạ'],
  ['úy', 'uý'],
  ['ùy', 'uỳ'],
  ['ủy', 'uỷ'],
  ['ũy', 'uỹ'],
  ['ụy', 'uỵ'],
]
const norm = (s: string) => TONE.reduce((t, [a, b]) => t.replaceAll(a, b), s.normalize('NFC'))
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Tên trùng với thứ khác: Hồ Chí Minh (Bác Hồ), Đồng Tháp Mười, sông Đồng Nai
const PATTERNS: Record<string, string> = {
  'ho-chi-minh': 'Thành phố Hồ Chí Minh',
  'dong-thap': 'Đồng Tháp(?! Mười)',
  'dong-nai': '(?<!sông )Đồng Nai',
}

const sentencesOf = (text: string) =>
  norm(text)
    .split(/(?<=[.;!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)

/** Những câu trong nội dung SGK nhắc tới tỉnh, theo từng mục; bỏ các mục đã gắn với chính tỉnh đó */
export function provinceMentions(items: ContentItem[], provinceId: string): ProvinceMention[] {
  const province = provinces.find((p) => p.id === provinceId)
  if (!province) return []
  const pattern = new RegExp(`${PATTERNS[provinceId] ?? escape(norm(province.name))}(?![\\p{L}])`, 'u')
  return items
    .filter((i) => i.provinceId !== provinceId)
    .map((item) => ({
      item,
      sentences: [item.summary, ...item.highlights, ...item.keyPoints, ...(item.funFacts ?? [])]
        .flatMap(sentencesOf)
        .filter((s) => pattern.test(s)),
    }))
    .filter((m) => m.sentences.length > 0)
}
