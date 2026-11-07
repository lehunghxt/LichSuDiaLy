import { BookOpen, Map as MapIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { TAB_BAR } from '../../features/map/fit'
import { NAV_ITEMS } from './navItems'

// Nhãn ngắn để cả 4 mục nằm trên một hàng (khung 1/3 màn hình, hoặc màn điện thoại)
const SHORT_LABELS: Record<string, string> = { '/ban-do': 'Bản đồ', '/tien-do': 'Tiến độ' }

function NavTabs() {
  return (
    <ul className="grid grid-cols-4 gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-xs font-semibold transition-colors',
                isActive ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-primary-soft hover:text-ink',
              ].join(' ')
            }
          >
            <Icon aria-hidden className="size-5" />
            <span className="whitespace-nowrap">{SHORT_LABELS[to] ?? label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

interface CompactNavProps {
  /** bar: logo + menu ở đầu khung thông tin (desktop); tabs: thanh tab dính đáy màn hình (điện thoại) */
  variant: 'bar' | 'tabs'
}

/** Điều hướng gọn cho trang toàn màn hình (bản đồ) */
export function CompactNav({ variant }: CompactNavProps) {
  if (variant === 'tabs') {
    // Không có logo: đã có tab Trang chủ. Chừa vạch vuốt của iPhone (safe-area)
    return (
      <nav
        aria-label="Điều hướng chính"
        style={{ height: `calc(${TAB_BAR}px + env(safe-area-inset-bottom))` }}
        className="fixed inset-x-0 bottom-0 z-[1200] flex flex-col justify-center border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur"
      >
        <div className="mx-auto w-full max-w-lg">
          <NavTabs />
        </div>
      </nav>
    )
  }
  return (
    // Dính sát mép trên khung thông tin khi cuộn (top âm bù phần padding của khung); nền + lề âm để nội dung trượt khuất bên dưới
    <div className="sticky -top-4 z-10 -mx-4 -mt-4 flex items-center gap-3 bg-bg/95 px-4 pb-3 pt-4 backdrop-blur xl:-top-5 xl:-mx-5 xl:-mt-5 xl:px-5 xl:pt-5">
      <Link to="/" aria-label="Em khám phá Lịch sử và Địa lí Việt Nam – Trang chủ" className="shrink-0">
        <span className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-400 shadow-md">
          <BookOpen aria-hidden className="size-7 text-white" />
          <MapIcon aria-hidden className="absolute -right-1 -top-1 size-5 rounded-md bg-sky-500 p-0.5 text-white" />
        </span>
      </Link>
      <nav aria-label="Điều hướng chính" className="min-w-0 flex-1 rounded-2xl border border-line bg-surface p-1 shadow-sm">
        <NavTabs />
      </nav>
    </div>
  )
}
