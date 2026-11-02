import { Compass, Gem, Landmark, Mountain, PartyPopper, type LucideIcon } from 'lucide-react'
import type { TopicCategory } from '../../types/content'

export const TOPIC_ICONS: Record<TopicCategory, LucideIcon> = {
  natural: Mountain,
  culture: PartyPopper,
  mineral: Gem,
  landmark: Compass,
  historical_site: Landmark,
}

/** Màu ô chủ đề (nền nhạt + biểu tượng đậm), lớp Tailwind viết đầy đủ để không bị lọc khi build */
export const TOPIC_TILE: Record<TopicCategory, { tile: string; icon: string }> = {
  natural: { tile: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', icon: 'text-emerald-600' },
  culture: { tile: 'bg-rose-50 border-rose-200 hover:border-rose-400', icon: 'text-rose-600' },
  mineral: { tile: 'bg-amber-50 border-amber-200 hover:border-amber-400', icon: 'text-amber-600' },
  landmark: { tile: 'bg-sky-50 border-sky-200 hover:border-sky-400', icon: 'text-sky-600' },
  historical_site: { tile: 'bg-violet-50 border-violet-200 hover:border-violet-400', icon: 'text-violet-600' },
}
