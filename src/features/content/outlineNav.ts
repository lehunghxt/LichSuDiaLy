// Tìm phần/mục trong dàn ý vùng: mở modal đúng chỗ từ một mục nội dung hoặc từ link cũ
import { SECTIONS, type OutlineTopic, type RegionOutline, type SectionId } from '../../types/content'

export interface OutlineTarget {
  section: SectionId
  topicId: string | null
  /** Slug mục nội dung cần hiện trong mục dàn ý (null = mục nội dung đầu tiên) */
  slug: string | null
}

export const isSection = (v: string | null): v is SectionId => SECTIONS.some((s) => s === v)

export function findTopic(outline: RegionOutline, section: SectionId, topicId: string | null): OutlineTopic | undefined {
  const topics = outline.sections.find((s) => s.id === section)?.topics ?? []
  return topics.find((t) => t.id === topicId) ?? topics[0]
}

export function topicOfItem(outline: RegionOutline, itemId: string): { section: SectionId; topicId: string } | null {
  for (const s of outline.sections) {
    const t = s.topics.find((x) => x.itemIds.includes(itemId))
    if (t) return { section: s.id, topicId: t.id }
  }
  return null
}

// Chủ đề cũ (trước khi có dàn ý) → phần mới
const LEGACY_SECTION: Record<string, SectionId> = {
  natural: 'thien-nhien',
  mineral: 'thien-nhien',
  landmark: 'thien-nhien',
  culture: 'van-hoa',
  historical_site: 'lich-su',
}

/** Link cũ ?chu-de=<chủ đề cũ hoặc phần>&muc=<slug mục nội dung> → vị trí trong dàn ý; không hiểu được → null */
export function legacyTarget(outline: RegionOutline, chuDe: string, slug: string | null): OutlineTarget | null {
  if (slug) {
    const at = topicOfItem(outline, `${outline.regionId}__${slug}`)
    if (at) return { ...at, slug }
  }
  const section = isSection(chuDe) ? chuDe : LEGACY_SECTION[chuDe]
  if (!section) return null
  return { section, topicId: findTopic(outline, section, null)?.id ?? null, slug: null }
}
