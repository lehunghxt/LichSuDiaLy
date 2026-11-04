// Dàn ý vùng (src/data/regions/<regionId>/outline.json): phần → mục → itemIds
import { SECTIONS, type OutlineSection, type OutlineTopic, type RegionOutline, type SectionId } from '../../types/content'
import { ContentError, join, list, obj, oneOf, optStr, str, strList } from './parse'

export function parseOutline(raw: unknown, regionId: string, path: string): RegionOutline {
  const seen = new Set<string>()
  const parseTopic = (v: unknown, p: string): OutlineTopic => {
    const o = obj(v, p)
    const id = str(o, 'id', p)
    if (seen.has(id)) throw new ContentError(join(p, 'id'), `trùng id mục "${id}"`)
    seen.add(id)
    const itemIds = strList(o, 'itemIds', p)
    const foreign = itemIds.find((i) => !i.startsWith(`${regionId}__`))
    if (foreign) throw new ContentError(join(p, 'itemIds'), `"${foreign}" không thuộc vùng "${regionId}"`)
    return { id, title: str(o, 'title', p), hint: optStr(o, 'hint', p), itemIds }
  }
  const parseSection = (v: unknown, p: string): OutlineSection => {
    const o = obj(v, p)
    return { id: oneOf(o, 'id', p, SECTIONS), topics: list(o, 'topics', p, parseTopic) }
  }
  const root = obj(raw, path)
  return { regionId, sections: list(root, 'sections', path, parseSection) }
}

/** Đối chiếu dàn ý với các mục nội dung của vùng. Rỗng nghĩa là hợp lệ */
export function checkOutlineIntegrity(outline: RegionOutline, items: { id: string; section: SectionId }[]): string[] {
  const errors: string[] = []
  const r = outline.regionId
  const byId = new Map(items.map((i) => [i.id, i]))
  const placed = new Set<string>()
  for (const section of outline.sections) {
    for (const topic of section.topics) {
      for (const id of topic.itemIds) {
        const item = byId.get(id)
        if (!item) errors.push(`${r} / ${topic.id}: không có mục nội dung "${id}"`)
        else if (item.section !== section.id)
          errors.push(`${r} / ${topic.id}: mục "${id}" thuộc phần "${item.section}" nhưng nằm trong phần "${section.id}"`)
        if (placed.has(id)) errors.push(`${r} / ${topic.id}: mục "${id}" đã nằm trong một mục khác`)
        placed.add(id)
      }
    }
  }
  for (const item of items) if (!placed.has(item.id)) errors.push(`${r}: mục nội dung "${item.id}" chưa nằm trong dàn ý`)
  return errors
}
