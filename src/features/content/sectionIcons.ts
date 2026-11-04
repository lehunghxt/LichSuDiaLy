import { Landmark, Mountain, PartyPopper, Users, type LucideIcon } from 'lucide-react'
import type { SectionId } from '../../types/content'

export const SECTION_ICONS: Record<SectionId, LucideIcon> = {
  'thien-nhien': Mountain,
  'dan-cu-san-xuat': Users,
  'van-hoa': PartyPopper,
  'lich-su': Landmark,
}

/** Màu thẻ phần (nền nhạt + biểu tượng đậm), lớp Tailwind viết đầy đủ để không bị lọc khi build */
export const SECTION_TILE: Record<SectionId, { tile: string; icon: string }> = {
  'thien-nhien': { tile: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', icon: 'text-emerald-600' },
  'dan-cu-san-xuat': { tile: 'bg-amber-50 border-amber-200 hover:border-amber-400', icon: 'text-amber-600' },
  'van-hoa': { tile: 'bg-rose-50 border-rose-200 hover:border-rose-400', icon: 'text-rose-600' },
  'lich-su': { tile: 'bg-violet-50 border-violet-200 hover:border-violet-400', icon: 'text-violet-600' },
}
