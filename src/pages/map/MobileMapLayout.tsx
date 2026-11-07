import type { CSSProperties, ReactNode } from 'react'
import { CompactNav } from '../../components/layout/CompactNav'
import { TAB_BAR } from '../../features/map/fit'
import { MapSheet, sheetCss, type Snap } from '../../features/map/MapSheet'

interface MobileMapLayoutProps {
  map: ReactNode
  /** Dải chip các vùng nổi ở mép trên bản đồ */
  chips: ReactNode
  /** Nội dung khung thông tin (vùng, tỉnh, nguồn) */
  panel: ReactNode
  /** Đang xem một vùng: hiện bottom sheet; chưa chọn vùng thì bản đồ chiếm trọn màn hình */
  sheetOpen: boolean
  snap: Snap
  onSnap(snap: Snap): void
}

/** Điện thoại, máy tính bảng dựng đứng: bản đồ toàn màn hình, thanh tab ở đáy, thông tin vùng trong bottom sheet */
export function MobileMapLayout({ map, chips, panel, sheetOpen, snap, onSnap }: MobileMapLayoutProps) {
  // Thước tỉ lệ và dòng ghi nguồn của bản đồ đẩy lên trên thanh tab và mép tấm
  const bottomInset = sheetOpen ? `calc(${sheetCss(snap)} + ${TAB_BAR}px)` : `${TAB_BAR}px`
  return (
    <>
      <div
        data-map-frame
        style={{ '--map-bottom-inset': `calc(${bottomInset} + env(safe-area-inset-bottom))` } as CSSProperties}
        className="relative h-dvh overflow-hidden bg-sea"
      >
        {map}
        <div data-map-legend className="absolute left-3 right-14 top-3 z-[1000] flex">
          {chips}
        </div>
      </div>
      {sheetOpen && (
        <MapSheet snap={snap} onSnap={onSnap}>
          {panel}
        </MapSheet>
      )}
      <CompactNav variant="tabs" />
    </>
  )
}
