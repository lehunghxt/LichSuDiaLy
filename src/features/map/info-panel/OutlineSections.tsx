import { SECTION_LABELS, type ContentItem, type RegionOutline, type SectionId } from '../../../types/content'
import { SECTION_ICONS, SECTION_TILE } from '../../content/sectionIcons'

export interface OutlineSectionsProps {
  outline: RegionOutline
  /** Mục nội dung đã tải (đã lọc theo quy tắc xuất bản); mục dàn ý không có mục nào ở đây là "đang cập nhật" */
  items: ContentItem[]
  onOpen(section: SectionId, topicId: string): void
}

/** Dàn ý vùng: mỗi phần một thẻ, liệt kê các mục; mục chưa có nội dung màu xám */
export function OutlineSections({ outline, items, onOpen }: OutlineSectionsProps) {
  const ids = new Set(items.map((i) => i.id))
  return (
    <nav aria-label="Dàn ý vùng" className="flex flex-col gap-3 border-t border-line pt-5">
      {outline.sections.map((section) => {
        const Icon = SECTION_ICONS[section.id]
        const style = SECTION_TILE[section.id]
        const label = SECTION_LABELS[section.id]
        const filled = section.topics.filter((t) => t.itemIds.some((id) => ids.has(id))).length
        return (
          <div key={section.id} className={`rounded-2xl border-2 p-3 ${style.tile}`}>
            <div className="mb-2 flex items-center gap-2">
              <Icon aria-hidden className={`size-6 shrink-0 ${style.icon}`} strokeWidth={1.75} />
              <h3 className="flex-1 text-base font-bold leading-snug">{label}</h3>
              <p className="shrink-0 text-xs font-semibold text-muted">
                {filled}/{section.topics.length} mục có nội dung
              </p>
            </div>
            {section.topics.length === 0 ? (
              <p className="text-sm text-muted">Nội dung đang được cập nhật.</p>
            ) : (
              <ul aria-label={label} className="flex flex-wrap gap-1.5">
                {section.topics.map((t) => {
                  const empty = !t.itemIds.some((id) => ids.has(id))
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        data-topic={t.id}
                        title={t.hint ? `${t.title} ${t.hint}` : t.title}
                        onClick={() => onOpen(section.id, t.id)}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-left text-sm leading-snug transition-colors ${
                          empty
                            ? 'border-dashed border-line bg-white/60 text-muted hover:bg-white'
                            : 'border-transparent bg-white font-semibold shadow-sm hover:border-current'
                        }`}
                      >
                        {t.title}
                        {empty && <span className="whitespace-nowrap text-xs font-normal italic">(đang cập nhật)</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
