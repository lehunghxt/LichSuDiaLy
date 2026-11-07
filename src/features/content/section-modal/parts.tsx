// Các mảnh của khung xem bài, dùng chung cho mọi thiết bị. Không chứa lớp responsive (sm:/md:/lg:):
// kiểu hiển thị khác nhau chọn qua prop, file bố cục của từng thiết bị quyết định dùng kiểu nào.
import { X } from 'lucide-react'
import type { Ref, RefObject } from 'react'
import { EmptyState } from '../../../components/ui/states'
import {
  SECTION_LABELS,
  type ContentItem,
  type OutlineTopic,
  type RegionMeta,
  type RegionOutline,
  type SectionId,
  type WebImage,
} from '../../../types/content'
import { ItemDetail } from '../ItemDetail'
import { itemSlug } from '../links'
import { SECTION_ICONS } from '../sectionIcons'

/** Mọi thứ bố cục cần để dựng khung xem bài (do SectionModal tính sẵn) */
export interface SectionModalView {
  titleId: string
  region: RegionMeta
  outline: RegionOutline
  section: SectionId
  topics: OutlineTopic[]
  topic: OutlineTopic | undefined
  /** Mục nội dung đã xuất bản của vùng, theo id */
  byId: Map<string, ContentItem>
  /** Mục nội dung của mục dàn ý đang xem */
  shown: ContentItem[]
  images: WebImage[]
  onSelect(section: SectionId, topicId: string | null): void
  onSelectItem(item: ContentItem): void
  onClose(): void
  closeRef: RefObject<HTMLButtonElement | null>
  /** Vùng cuộn nội dung: SectionModal cuộn tới mục được chọn trong đây */
  detailRef: RefObject<HTMLDivElement | null>
}

export function SectionTitle({ view, size }: { view: SectionModalView; size: 'md' | 'lg' }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold" style={{ color: `var(--color-${view.region.color})` }}>
        {view.region.name}
      </p>
      <h2 id={view.titleId} className={`font-bold ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
        {SECTION_LABELS[view.section]}
      </h2>
    </div>
  )
}

/** Các phần của dàn ý. scroll: một hàng vuốt ngang; wrap: xuống hàng khi chật */
export function SectionTabs({ view, layout, className = '' }: { view: SectionModalView; layout: 'scroll' | 'wrap'; className?: string }) {
  return (
    <nav
      aria-label="Các phần"
      className={`flex gap-2 ${layout === 'scroll' ? 'overflow-x-auto pb-1 [scrollbar-width:none]' : 'flex-wrap'} ${className}`}
    >
      {view.outline.sections.map((s) => {
        const Icon = SECTION_ICONS[s.id]
        const active = s.id === view.section
        return (
          <button
            key={s.id}
            type="button"
            aria-pressed={active}
            onClick={() => view.onSelect(s.id, null)}
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
  )
}

/** Các mục trong phần. row: một hàng vuốt ngang, chỉ tên mục; column: cột dọc, có cả gợi ý của mục */
export function TopicList({ view, layout }: { view: SectionModalView; layout: 'row' | 'column' }) {
  if (view.topics.length === 0) return null
  const row = layout === 'row'
  return (
    <ul aria-label="Các mục trong phần" className={row ? 'flex gap-1.5 overflow-x-auto [scrollbar-width:none]' : 'flex flex-col gap-1.5'}>
      {view.topics.map((t) => {
        const active = t.id === view.topic?.id
        const empty = !t.itemIds.some((id) => view.byId.has(id))
        return (
          <li key={t.id} className={row ? 'shrink-0' : ''}>
            <button
              type="button"
              aria-current={active ? 'true' : undefined}
              onClick={() => view.onSelect(view.section, t.id)}
              className={`min-h-11 w-full rounded-2xl border-2 px-4 text-left transition-colors ${row ? 'whitespace-nowrap py-2' : 'py-2.5'} ${
                active ? 'border-primary bg-primary-soft text-primary' : 'border-transparent hover:border-line hover:bg-bg'
              } ${empty && !active ? 'text-muted' : ''}`}
            >
              <span className="block font-semibold leading-snug">{t.title}</span>
              {!row && t.hint && <span className="block text-sm leading-snug text-muted">{t.hint}</span>}
              {empty && <span className="block text-xs italic text-muted">(đang cập nhật)</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Nội dung của mục dàn ý đang xem: từng mục nội dung, hoặc thông báo đang cập nhật */
export function TopicContent({ view }: { view: SectionModalView }) {
  const relatedOf = (item: ContentItem) => item.relatedIds.map((id) => view.byId.get(id)).filter((i): i is ContentItem => i !== undefined)
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      {view.shown.length === 0 ? (
        <EmptyState
          title="Nội dung đang được cập nhật"
          description={
            view.topic
              ? `Phần "${view.topic.title}" sẽ sớm có nội dung. Em hãy chọn mục khác nhé!`
              : 'Em hãy chọn phần khác ở phía trên nhé!'
          }
        />
      ) : (
        view.shown.map((item, i) => (
          <div key={item.id} data-item={itemSlug(item.id)} className={i > 0 ? 'border-t-2 border-dashed border-line pt-10' : ''}>
            <ItemDetail
              item={item}
              regionName={view.region.name}
              webImages={view.images.filter((img) => img.itemIds.includes(item.id))}
              related={relatedOf(item)}
              onSelectRelated={view.onSelectItem}
            />
          </div>
        ))
      )}
    </div>
  )
}

/** Nút đóng. icon: nút tròn ✕ (điện thoại); labelled: nút viền có chữ "Đóng" (màn rộng) */
export function CloseButton({ view, variant }: { view: SectionModalView; variant: 'icon' | 'labelled' }) {
  const ref: Ref<HTMLButtonElement> = view.closeRef
  return (
    <button
      ref={ref}
      type="button"
      onClick={view.onClose}
      aria-label="Đóng"
      title="Đóng"
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50 ${
        variant === 'icon'
          ? 'w-10 bg-bg text-muted hover:bg-line hover:text-ink'
          : 'border border-line bg-surface px-4 font-semibold text-ink hover:bg-bg'
      }`}
    >
      <X aria-hidden className="size-5" strokeWidth={2.5} />
      {variant === 'labelled' && <span aria-hidden>Đóng</span>}
    </button>
  )
}
