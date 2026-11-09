import type { RegionMeta } from '../../types/content'
import type { HomeSummary } from '../../types/homeSummary'

/** Dữ liệu Trang chủ, do HomePage chuẩn bị, mọi bố cục dùng chung */
export interface HomeView {
  regions: RegionMeta[]
  /** Số liệu của cả bốn vùng, tính sẵn lúc build: Trang chủ không phải tải nội dung đầy đủ của từng vùng */
  summary: HomeSummary
}
