import type { RegionContent, RegionMeta, RegionOutline } from '../../types/content'

/** Dữ liệu Trang chủ, do HomePage chuẩn bị, mọi bố cục dùng chung */
export interface HomeView {
  /** Nội dung vùng đang mở (null khi đang tải) */
  content: RegionContent | null
  regionCount: number
  /** Vùng đang có nội dung và dàn ý của nó (để hiện "Các phần khám phá") */
  active: RegionMeta | undefined
  outline: RegionOutline | null
}
