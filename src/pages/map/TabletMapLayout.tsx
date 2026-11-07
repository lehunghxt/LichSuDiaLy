import { X } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { CompactNav } from '../../components/layout/CompactNav'
import { TAB_BAR } from '../../components/sheet/sizes'
import { SIDE_PANEL } from '../../features/map/fit'

interface TabletMapLayoutProps {
  map: ReactNode
  /** Dải chip các vùng nổi ở mép trên bản đồ */
  chips: ReactNode
  /** Nội dung khung thông tin (vùng, tỉnh, nguồn) */
  panel: ReactNode
  /** Đang xem một vùng: hiện khung nổi bên phải; chưa chọn vùng thì bản đồ chiếm trọn màn hình */
  panelOpen: boolean
  onClosePanel(): void
}

// Lề quanh khung nổi
const GAP = 12

/** Máy tính bảng: bản đồ toàn màn hình, thanh tab ở đáy, thông tin vùng trong khung nổi bo góc ở mép phải */
export function TabletMapLayout({ map, chips, panel, panelOpen, onClosePanel }: TabletMapLayoutProps) {
  // Nút phóng to/thu nhỏ (góc phải) dời sang trái khung nổi; thước tỉ lệ, ghi nguồn đẩy lên trên thanh tab
  const rightInset = panelOpen ? SIDE_PANEL + GAP : 0
  const frameStyle = {
    '--map-right-inset': `${rightInset}px`,
    '--map-bottom-inset': `calc(${TAB_BAR}px + env(safe-area-inset-bottom))`,
  } as CSSProperties
  return (
    <>
      <div data-map-frame style={frameStyle} className="relative h-dvh overflow-hidden bg-sea">
        {map}
        {/* Chừa bên phải cho nút phóng to/thu nhỏ (và khung nổi khi đang mở) */}
        <div data-map-legend style={{ right: rightInset + 56 }} className="absolute left-3 top-3 z-[1000] flex">
          {chips}
        </div>
      </div>
      {panelOpen && (
        <aside
          aria-label="Thông tin bản đồ"
          style={{ width: SIDE_PANEL, bottom: `calc(${TAB_BAR + GAP}px + env(safe-area-inset-bottom))` }}
          className="animate-fade-in fixed right-3 top-3 z-[1100] flex flex-col gap-5 overflow-y-auto overscroll-contain rounded-3xl bg-bg p-4 pt-3 shadow-[0_12px_40px_rgba(15,23,42,0.22)]"
        >
          <button
            type="button"
            aria-label="Đóng khung thông tin"
            title="Đóng"
            onClick={onClosePanel}
            className="sticky top-0 z-10 -mb-3 ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-muted shadow-sm transition-colors hover:bg-line hover:text-ink"
          >
            <X aria-hidden className="size-5" strokeWidth={2.5} />
          </button>
          {panel}
        </aside>
      )}
      <CompactNav variant="tabs" />
    </>
  )
}
