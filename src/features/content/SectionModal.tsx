import { X } from 'lucide-react'
import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import { EmptyState } from '../../components/ui/states'
import {
  SECTION_LABELS,
  type ContentItem,
  type RegionMeta,
  type RegionOutline,
  type SectionId,
  type WebImage,
} from '../../types/content'
import { ItemDetail } from './ItemDetail'
import { itemSlug } from './links'
import { findTopic } from './outlineNav'
import { SECTION_ICONS } from './sectionIcons'

interface SectionModalProps {
  region: RegionMeta
  outline: RegionOutline
  /** Mục nội dung đã xuất bản của vùng (rỗng khi vùng chưa có nội dung) */
  items: ContentItem[]
  /** Ảnh nhúng của vùng; mỗi mục nội dung hiện ảnh gắn với nó */
  images?: WebImage[]
  section: SectionId
  /** Mục trong dàn ý; null hoặc không tìm thấy thì hiện mục đầu tiên của phần */
  topicId: string | null
  /** Mục nội dung cần cuộn tới trong mục dàn ý (slug sau "__") */
  itemSlug: string | null
  onSelect(section: SectionId, topicId: string | null): void
  /** Bấm "Khám phá thêm": mở mục dàn ý chứa mục nội dung đó */
  onSelectItem(item: ContentItem): void
  onClose(): void
}

const FOCUSABLE = 'a[href], button:not([disabled]), audio[controls], [tabindex]:not([tabindex="-1"])'

/** Modal toàn màn hình theo dàn ý: thanh trên là các phần, cột trái là các mục, khung phải là nội dung của mục */
export function SectionModal(props: SectionModalProps) {
  const { region, outline, items, images = [], section, topicId, itemSlug: slug, onSelect, onSelectItem, onClose } = props
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const closeCb = useRef(onClose)
  useEffect(() => {
    closeCb.current = onClose
  }, [onClose])

  const byId = new Map(items.map((i) => [i.id, i]))
  const topics = outline.sections.find((s) => s.id === section)?.topics ?? []
  const topic = findTopic(outline, section, topicId)
  const shown = (topic?.itemIds ?? []).map((id) => byId.get(id)).filter((i): i is ContentItem => i !== undefined)
  const relatedOf = (item: ContentItem) =>
    item.relatedIds.map((id) => byId.get(id)).filter((i): i is ContentItem => i !== undefined)

  // Mở modal: khoá cuộn trang, đưa focus vào nút Đóng; đóng: trả focus về chỗ cũ
  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeCb.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [])

  // Đổi mục: cuộn tới mục nội dung được chọn, hoặc lên đầu
  const topicKey = topic?.id
  useEffect(() => {
    const target = slug ? detailRef.current?.querySelector(`[data-item="${CSS.escape(slug)}"]`) : null
    if (target) target.scrollIntoView?.({ block: 'start' })
    else detailRef.current?.scrollTo?.({ top: 0 })
  }, [topicKey, slug])

  // Giữ Tab trong modal
  const trapTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return
    const nodes = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={trapTab}
      className="fixed inset-0 z-[1300] flex flex-col bg-bg"
    >
      <header className="flex flex-wrap items-center gap-4 border-b border-line bg-surface px-6 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: `var(--color-${region.color})` }}>
            {region.name}
          </p>
          <h2 id={titleId} className="text-2xl font-bold">
            {SECTION_LABELS[section]}
          </h2>
        </div>
        <nav aria-label="Các phần" className="flex flex-wrap gap-2">
          {outline.sections.map((s) => {
            const Icon = SECTION_ICONS[s.id]
            const active = s.id === section
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(s.id, null)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3 text-sm font-semibold transition-colors ${
                  active ? 'border-primary bg-primary text-white' : 'border-line bg-surface hover:border-primary'
                }`}
              >
                <Icon aria-hidden className="size-4" />
                {SECTION_LABELS[s.id]}
              </button>
            )
          })}
        </nav>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 font-semibold text-white hover:brightness-110"
        >
          <X aria-hidden className="size-5" />
          Đóng
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)]">
        <aside className="overflow-y-auto border-r border-line bg-surface p-4">
          {topics.length > 0 && (
            <ul aria-label="Các mục trong phần" className="flex flex-col gap-1.5">
              {topics.map((t) => {
                const active = t.id === topic?.id
                const empty = !t.itemIds.some((id) => byId.has(id))
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => onSelect(section, t.id)}
                      className={`w-full rounded-2xl border-2 px-4 py-2.5 text-left transition-colors ${
                        active ? 'border-primary bg-primary-soft text-primary' : 'border-transparent hover:border-line hover:bg-bg'
                      } ${empty && !active ? 'text-muted' : ''}`}
                    >
                      <span className="block font-semibold leading-snug">{t.title}</span>
                      {t.hint && <span className="block text-sm leading-snug text-muted">{t.hint}</span>}
                      {empty && <span className="block text-xs italic text-muted">(đang cập nhật)</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
        <div ref={detailRef} className="overflow-y-auto p-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            {shown.length === 0 ? (
              <EmptyState
                title="Nội dung đang được cập nhật"
                description={topic ? `Phần "${topic.title}" sẽ sớm có nội dung. Em hãy chọn mục khác nhé!` : 'Em hãy chọn phần khác ở phía trên nhé!'}
              />
            ) : (
              shown.map((item, i) => (
                <div key={item.id} data-item={itemSlug(item.id)} className={i > 0 ? 'border-t-2 border-dashed border-line pt-10' : ''}>
                  <ItemDetail
                    item={item}
                    regionName={region.name}
                    webImages={images.filter((img) => img.itemIds.includes(item.id))}
                    related={relatedOf(item)}
                    onSelectRelated={onSelectItem}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
