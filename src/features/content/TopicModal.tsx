import { MapPin, X } from 'lucide-react'
import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import { EmptyState } from '../../components/ui/states'
import { provinceName } from '../../lib/provinces'
import { TOPIC_CATEGORIES, TOPIC_LABELS, type ContentItem, type RegionContent, type TopicCategory, type WebImage } from '../../types/content'
import { ItemDetail } from './ItemDetail'
import { itemSlug } from './links'
import { getItemsByCategory } from './repository'
import { TOPIC_ICONS } from './topicIcons'

interface TopicModalProps {
  content: RegionContent
  /** Ảnh nhúng của vùng; modal lọc theo mục đang xem */
  images?: WebImage[]
  category: TopicCategory
  /** Phần sau "__" của id mục; null hoặc không tìm thấy thì hiện mục đầu tiên */
  itemSlug: string | null
  onSelect(category: TopicCategory, slug: string | null): void
  onClose(): void
}

const FOCUSABLE = 'a[href], button:not([disabled]), audio[controls], [tabindex]:not([tabindex="-1"])'

/** Modal toàn màn hình: chọn chủ đề, danh sách mục bên trái, chi tiết mục bên phải */
export function TopicModal({ content, images = [], category, itemSlug: slug, onSelect, onClose }: TopicModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const closeCb = useRef(onClose)
  useEffect(() => {
    closeCb.current = onClose
  }, [onClose])

  const items = getItemsByCategory(content, category)
  const selected = items.find((i) => itemSlug(i.id) === slug) ?? items[0]
  const related = (selected?.relatedIds ?? [])
    .map((id) => content.items.find((i) => i.id === id))
    .filter((i): i is ContentItem => i !== undefined)

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

  // Đổi mục: cuộn phần chi tiết lên đầu
  const selectedId = selected?.id
  useEffect(() => {
    detailRef.current?.scrollTo?.({ top: 0 })
  }, [selectedId])

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
          <p className="text-sm font-semibold" style={{ color: `var(--color-${content.region.color})` }}>
            {content.region.name}
          </p>
          <h2 id={titleId} className="text-2xl font-bold">
            {TOPIC_LABELS[category]}
          </h2>
        </div>
        <nav aria-label="Chủ đề" className="flex flex-wrap gap-2">
          {TOPIC_CATEGORIES.map((c) => {
            const Icon = TOPIC_ICONS[c]
            const active = c === category
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(c, null)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3 text-sm font-semibold transition-colors ${
                  active ? 'border-primary bg-primary text-white' : 'border-line bg-surface hover:border-primary'
                }`}
              >
                <Icon aria-hidden className="size-4" />
                {TOPIC_LABELS[c]}
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

      {items.length === 0 || !selected ? (
        <div className="p-8">
          <EmptyState title="Nội dung đang được cập nhật" description="Em hãy chọn chủ đề khác ở phía trên nhé!" />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)]">
          <aside className="overflow-y-auto border-r border-line bg-surface p-4">
            <ul aria-label="Các mục trong chủ đề" className="flex flex-col gap-2">
              {items.map((i) => {
                const active = i.id === selected.id
                return (
                  <li key={i.id}>
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => onSelect(category, itemSlug(i.id))}
                      className={`w-full rounded-2xl border-2 px-4 py-3 text-left font-semibold transition-colors ${
                        active ? 'border-primary bg-primary-soft text-primary' : 'border-transparent hover:border-line hover:bg-bg'
                      }`}
                    >
                      <span className="block">{i.title}</span>
                      {provinceName(i.provinceId) && (
                        <span className="mt-0.5 flex items-center gap-1 text-sm font-normal text-muted">
                          <MapPin aria-hidden className="size-3.5 shrink-0" />
                          {provinceName(i.provinceId)}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </aside>
          <div ref={detailRef} className="overflow-y-auto p-8">
            <div className="mx-auto max-w-5xl">
              <ItemDetail
                item={selected}
                regionName={content.region.name}
                webImages={images.filter((img) => img.itemIds.includes(selected.id))}
                related={related}
                onSelectRelated={onSelect}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
