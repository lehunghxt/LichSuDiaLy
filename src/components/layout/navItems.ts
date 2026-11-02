import { BookOpenCheck, House, Map, TrendingUp, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Trang chủ', icon: House },
  { to: '/ban-do', label: 'Bản đồ khám phá', icon: Map },
  { to: '/on-tap', label: 'Trắc nghiệm', icon: BookOpenCheck },
  { to: '/tien-do', label: 'Tiến độ học tập', icon: TrendingUp },
]
