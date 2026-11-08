import type { CSSProperties, ReactNode } from 'react'
import { SheetHandle } from './SheetHandle'
import { HALF_SHEET, TAB_BAR } from './sizes'
import { useSheetDrag } from './useSheetDrag'

export type Snap = 'peek' | 'half' | 'full'

// Thu gọn: chỉ thấy thanh nắm và đầu nội dung; mở hết: vẫn chừa dải chip ở mép trên màn hình.
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

interface SnapSheetProps {
  /** Tên vùng mốc (landmark) của tấm */
  label: string
  snap: Snap
  onSnap(snap: Snap): void
  children: ReactNode
}

/** Bottom sheet không chặn, nổi trên nội dung toàn màn hình (bản đồ), ngay trên thanh tab, có ba mức mở.
 *  Kéo thanh nắm để đổi mức, thả tay thì bám mức gần nhất; bấm (hoặc Enter) để chuyển nửa ↔ gần hết. */
export function SnapSheet({ label, snap, onSnap, children }: SnapSheetProps) {
  const start = () => snapHeight(snap, window.innerHeight)
  const clamp = (h: number) => Math.min(Math.max(h, PEEK), window.innerHeight - TOP_GAP - TAB_BAR)
  const { down, handlers, consumeClick } = useSheetDrag((d) => onSnap(nearestSnap(clamp(start() - d), window.innerHeight)))
  const onClick = () => {
    if (!consumeClick()) onSnap(snap === 'half' ? 'full' : 'half')
  }

  const style = {
    '--tab-bar': `${TAB_BAR}px`,
    '--sheet-h': down === null ? SNAP_CSS[snap] : `${clamp(start() - down)}px`,
  } as CSSProperties
  return (
    <aside
      aria-label={label}
      data-snap={snap}
      style={style}
      className={`animate-sheet-up fixed inset-x-0 bottom-[calc(var(--tab-bar)+env(safe-area-inset-bottom))] z-overlay flex h-[var(--sheet-h)] flex-col rounded-t-3xl bg-bg shadow-[0_-8px_30px_rgba(15,23,42,0.18)] ${
        down === null ? 'transition-[height] duration-300 ease-out' : ''
      }`}
    >
      <SheetHandle
        handlers={handlers}
        label={snap === 'full' ? 'Kéo hoặc bấm để thu nhỏ khung thông tin' : 'Kéo hoặc bấm để mở rộng khung thông tin'}
        expanded={snap === 'full'}
        onClick={onClick}
      />
      <div data-sheet className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-4 pt-1">
        {children}
      </div>
    </aside>
  )
}
