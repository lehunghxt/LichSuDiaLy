import { X } from 'lucide-react'
import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import { EmptyState } from '../../components/ui/states'
import { SECTION_LABELS, type ContentItem, type RegionMeta, type RegionOutline, type SectionId, type WebImage } from '../../types/content'
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
  const relatedOf = (item: ContentItem) => item.relatedIds.map((id) => byId.get(id)).filter((i): i is ContentItem => i !== undefined)

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

  // Điện thoại: phần và mục hiện thành hàng cuộn ngang → đưa nút đang chọn vào tầm nhìn
  useEffect(() => {
    for (const el of dialogRef.current?.querySelectorAll('[aria-pressed="true"], [aria-current="true"]') ?? []) {
      el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }
  }, [section, topicKey])

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
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface px-4 py-3 shadow-sm sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: `var(--color-${region.color})` }}>
            {region.name}
          </p>
          <h2 id={titleId} className="text-xl font-bold sm:text-2xl">
            {SECTION_LABELS[section]}
          </h2>
        </div>
        <nav
          aria-label="Các phần"
          className="order-last -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 lg:order-none lg:mx-0 lg:w-auto lg:flex-wrap lg:overflow-visible lg:p-0"
        >
          {outline.sections.map((s) => {
            const Icon = SECTION_ICONS[s.id]
            const active = s.id === section
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(s.id, null)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border-2 px-3 text-sm font-semibold transition-colors ${
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

      <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="shrink-0 border-b border-line bg-surface p-2 md:overflow-y-auto md:border-b-0 md:border-r md:p-4">
          {topics.length > 0 && (
            <ul aria-label="Các mục trong phần" className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
              {topics.map((t) => {
                const active = t.id === topic?.id
                const empty = !t.itemIds.some((id) => byId.has(id))
                return (
                  <li key={t.id} className="shrink-0 md:shrink">
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => onSelect(section, t.id)}
                      className={`min-h-11 w-full whitespace-nowrap rounded-2xl border-2 px-4 py-2 text-left transition-colors md:whitespace-normal md:py-2.5 ${
                        active ? 'border-primary bg-primary-soft text-primary' : 'border-transparent hover:border-line hover:bg-bg'
                      } ${empty && !active ? 'text-muted' : ''}`}
                    >
                      <span className="block font-semibold leading-snug">{t.title}</span>
                      {t.hint && <span className="hidden text-sm leading-snug text-muted md:block">{t.hint}</span>}
                      {empty && <span className="block text-xs italic text-muted">(đang cập nhật)</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>
        <div ref={detailRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-10">
            {shown.length === 0 ? (
              <EmptyState
                title="Nội dung đang được cập nhật"
                description={
                  topic ? `Phần "${topic.title}" sẽ sớm có nội dung. Em hãy chọn mục khác nhé!` : 'Em hãy chọn phần khác ở phía trên nhé!'
                }
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
