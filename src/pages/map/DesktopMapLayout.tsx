import type { ReactNode } from 'react'
import { CompactNav } from '../../components/layout/CompactNav'

interface DesktopMapLayoutProps {
  map: ReactNode
  /** Dải chip các vùng nổi ở mép trên bản đồ */
  chips: ReactNode
  /** Nội dung khung thông tin (vùng, tỉnh, nguồn) */
  panel: ReactNode
}

/** Desktop: bản đồ 2/3 bên trái, khung thông tin 1/3 bên phải tự cuộn, logo + menu dính ở đầu khung */
export function DesktopMapLayout({ map, chips, panel }: DesktopMapLayoutProps) {
  return (
    <div className="grid h-dvh grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div data-map-frame className="relative h-full overflow-hidden bg-sea">
        {map}
        {/* Chừa bên phải cho nút phóng to/thu nhỏ của bản đồ */}
        <div data-map-legend className="absolute left-3 right-14 top-3 z-[1000] flex">
          {chips}
        </div>
      </div>
      <aside aria-label="Thông tin bản đồ" className="flex flex-col gap-5 overflow-y-auto overscroll-contain bg-bg p-4 xl:p-5">
        {/* Dính sát mép trên khung khi cuộn (top âm bù phần padding của khung); nền + lề âm để nội dung trượt khuất bên dưới */}
        <div className="sticky -top-4 z-10 -mx-4 -mt-4 bg-bg/95 px-4 pb-3 pt-4 backdrop-blur xl:-top-5 xl:-mx-5 xl:-mt-5 xl:px-5 xl:pt-5">
          <CompactNav variant="bar" />
        </div>
        {panel}
      </aside>
    </div>
  )
}
