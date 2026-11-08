import { useEffect, useId, useRef } from 'react'
import { ByDevice } from '../../../components/layout/ByDevice'
import { useDevice } from '../../../lib/device'
import type { ContentItem, RegionMeta, RegionOutline, SectionId, WebImage } from '../../../types/content'
import { findTopic } from '../outlineNav'
import { DesktopSectionModal } from './SectionModal.desktop'
import { MobileSectionModal } from './SectionModal.mobile'
import type { SectionModalView } from './parts'
import { TabletSectionModal } from './SectionModal.tablet'

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

/** Khung xem bài theo dàn ý: các phần, các mục của phần, nội dung của mục.
 *  Logic ở đây dùng chung; mỗi thiết bị một file bố cục (Mobile: bottom sheet; Tablet, Desktop: toàn màn hình). */
export function SectionModal(props: SectionModalProps) {
  const { region, outline, items, images = [], section, topicId, itemSlug: slug, onSelect, onSelectItem, onClose } = props
  const device = useDevice()
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const byId = new Map(items.map((i) => [i.id, i]))
  const topics = outline.sections.find((s) => s.id === section)?.topics ?? []
  const topic = findTopic(outline, section, topicId)
  const shown = (topic?.itemIds ?? []).map((id) => byId.get(id)).filter((i): i is ContentItem => i !== undefined)

  // Đổi mục: cuộn tới mục nội dung được chọn, hoặc lên đầu
  const topicKey = topic?.id
  useEffect(() => {
    const target = slug ? detailRef.current?.querySelector(`[data-item="${CSS.escape(slug)}"]`) : null
    if (target) target.scrollIntoView?.({ block: 'start' })
    else detailRef.current?.scrollTo?.({ top: 0 })
  }, [topicKey, slug, device])

  // Phần và mục có thể là hàng cuộn ngang → đưa nút đang chọn vào tầm nhìn
  useEffect(() => {
    // Chỉ hai hàng chọn phần và mục, không đụng nút bật/tắt trong nội dung (sẽ kéo vùng nội dung lệch khỏi mục đang đọc)
    const rows = '[aria-label="Các phần"] [aria-pressed="true"], [aria-label="Các mục trong phần"] [aria-current="true"]'
    for (const el of document.querySelectorAll(`[role="dialog"] :is(${rows})`)) {
      el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }
  }, [section, topicKey, device])

  const view: SectionModalView = {
    titleId,
    region,
    outline,
    section,
    topics,
    topic,
    byId,
    shown,
    images,
    onSelect,
    onSelectItem,
    onClose,
    closeRef,
    detailRef,
  }
  return (
    <ByDevice
      mobile={<MobileSectionModal view={view} />}
      tablet={<TabletSectionModal view={view} />}
      desktop={<DesktopSectionModal view={view} />}
    />
  )
}
