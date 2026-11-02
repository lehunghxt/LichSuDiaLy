import { Compass, Gem, Landmark, Mountain, PartyPopper, type LucideIcon } from 'lucide-react'
import type { TopicCategory } from '../../types/content'

export const TOPIC_ICONS: Record<TopicCategory, LucideIcon> = {
  natural: Mountain,
  culture: PartyPopper,
  mineral: Gem,
  landmark: Compass,
  historical_site: Landmark,
}
