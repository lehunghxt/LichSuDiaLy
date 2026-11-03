import { BookOpen, Map as MapIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'

/** Điều hướng gọn cho trang toàn màn hình (bản đồ): logo + các mục chính dạng nút nhỏ */
export function CompactNav() {
  return (
    <div className="flex items-center gap-3">
      <Link to="/" aria-label="Em khám phá Lịch sử và Địa lí Việt Nam" className="shrink-0">
        <span className="relative flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-emerald-400 shadow-md">
          <BookOpen aria-hidden className="size-6 text-white" />
          <MapIcon aria-hidden className="absolute -right-1 -top-1 size-5 rounded-md bg-sky-500 p-0.5 text-white" />
        </span>
      </Link>
      <nav aria-label="Điều hướng chính" className="min-w-0 flex-1">
        <ul className="flex flex-wrap gap-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                title={label}
                className={({ isActive }) =>
                  [
                    'inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors',
                    isActive ? 'bg-primary text-white shadow-sm' : 'border border-line bg-surface text-ink hover:bg-primary-soft',
                  ].join(' ')
                }
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
