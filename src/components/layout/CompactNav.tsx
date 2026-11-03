import { BookOpen, Map as MapIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'

// Nhãn ngắn để cả 4 mục nằm trên một hàng trong khung 1/3 màn hình
const SHORT_LABELS: Record<string, string> = { '/ban-do': 'Bản đồ', '/tien-do': 'Tiến độ' }

/** Điều hướng gọn cho trang toàn màn hình (bản đồ): logo + thanh tab 4 mục */
export function CompactNav() {
  return (
    <div className="flex items-center gap-3">
      <Link to="/" aria-label="Em khám phá Lịch sử và Địa lí Việt Nam – Trang chủ" className="shrink-0">
        <span className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-400 shadow-md">
          <BookOpen aria-hidden className="size-7 text-white" />
          <MapIcon aria-hidden className="absolute -right-1 -top-1 size-5 rounded-md bg-sky-500 p-0.5 text-white" />
        </span>
      </Link>
      <nav aria-label="Điều hướng chính" className="min-w-0 flex-1 rounded-2xl border border-line bg-surface p-1 shadow-sm">
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
      </nav>
    </div>
  )
}
