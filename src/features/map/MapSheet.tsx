import { type CSSProperties, type PointerEvent, type ReactNode, useRef, useState } from 'react'
import { HALF_SHEET, TAB_BAR } from './fit'

export type Snap = 'peek' | 'half' | 'full'

// Thu gọn: chỉ thấy thanh kéo và đầu nội dung; mở hết: vẫn chừa dải chip các vùng ở trên.
// Tấm ngồi ngay trên thanh tab ở đáy màn hình (TAB_BAR)
const PEEK = 112
const TOP_GAP = 48
const SNAPS: Snap[] = ['peek', 'half', 'full']

/** Chiều cao (px) của tấm ở từng mức, theo chiều cao màn hình */
export function snapHeight(snap: Snap, viewportHeight: number): number {
  if (snap === 'peek') return PEEK
  if (snap === 'half') return Math.round(viewportHeight * HALF_SHEET)
  return viewportHeight - TOP_GAP - TAB_BAR
}

/** Mức gần nhất với chiều cao lúc thả tay */
export function nearestSnap(height: number, viewportHeight: number): Snap {
  const dist = (s: Snap) => Math.abs(snapHeight(s, viewportHeight) - height)
  return SNAPS.reduce((a, b) => (dist(b) < dist(a) ? b : a))
}

// Chiều cao theo CSS (dvh) để tự đúng khi xoay màn hình hay thanh địa chỉ co giãn
const SNAP_CSS: Record<Snap, string> = {
  peek: `${PEEK}px`,
  half: `${HALF_SHEET * 100}dvh`,
  full: `calc(100dvh - ${TOP_GAP + TAB_BAR}px)`,
}
export const sheetCss = (snap: Snap) => SNAP_CSS[snap]

interface MapSheetProps {
  snap: Snap
  onSnap(snap: Snap): void
  children: ReactNode
}

/** Bố cục điện thoại: thông tin vùng là tấm kéo từ đáy, nổi trên bản đồ toàn màn hình, ngay trên thanh tab.
 *  Kéo thanh ở đầu tấm để đổi mức, thả tay thì bám mức gần nhất; bấm (hoặc Enter) để chuyển nửa ↔ gần hết. */
export function MapSheet({ snap, onSnap, children }: MapSheetProps) {
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  // Chiều cao lúc kéo giữ cả trong ref: lúc thả tay đọc từ đây, không phụ thuộc lần render gần nhất
  const drag = useRef<{ y: number; h: number; moved: boolean; height: number | null } | null>(null)
  // Sau một lần kéo, trình duyệt vẫn bắn sự kiện click: bỏ qua để không bị tính thêm một lần bấm
  const swallowClick = useRef(false)

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { y: e.clientY, h: snapHeight(snap, window.innerHeight), moved: false, height: null }
  }
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    const dy = d.y - e.clientY
    if (Math.abs(dy) > 4) d.moved = true
    if (!d.moved) return
    d.height = Math.min(Math.max(d.h + dy, PEEK), window.innerHeight - TOP_GAP - TAB_BAR)
    setDragHeight(d.height)
  }
  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved || d.height === null) return
    swallowClick.current = true
    onSnap(nearestSnap(d.height, window.innerHeight))
    setDragHeight(null)
  }
  const onClick = () => {
    if (swallowClick.current) {
      swallowClick.current = false
      return
    }
    onSnap(snap === 'half' ? 'full' : 'half')
  }

  const style = { '--tab-bar': `${TAB_BAR}px`, '--sheet-h': dragHeight === null ? SNAP_CSS[snap] : `${dragHeight}px` } as CSSProperties
  return (
    <aside
      aria-label="Thông tin bản đồ"
      data-snap={snap}
      style={style}
      className={`animate-sheet-up fixed inset-x-0 bottom-[calc(var(--tab-bar)+env(safe-area-inset-bottom))] z-[1100] flex h-[var(--sheet-h)] flex-col rounded-t-3xl bg-bg shadow-[0_-8px_30px_rgba(15,23,42,0.18)] ${
        dragHeight === null ? 'transition-[height] duration-300 ease-out' : ''
      }`}
    >
      <button
        type="button"
        aria-label={snap === 'full' ? 'Kéo hoặc bấm để thu nhỏ khung thông tin' : 'Kéo hoặc bấm để mở rộng khung thông tin'}
        aria-expanded={snap === 'full'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      >
        <span aria-hidden className="h-1.5 w-12 rounded-full bg-line" />
      </button>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-4 pt-1">{children}</div>
    </aside>
  )
}
