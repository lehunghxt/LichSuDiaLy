import { BookOpen, Map as MapIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'

// Nhãn ngắn để cả 4 mục nằm trên một hàng trong khung 1/3 màn hình
const SHORT_LABELS: Record<string, string> = { '/ban-do': 'Bản đồ', '/tien-do': 'Tiến độ' }

/** Điều hướng gọn cho trang toàn màn hình (bản đồ): logo + thanh tab 4 mục.
 *  Điện thoại, máy tính bảng (dưới lg): thanh tab dính ở đáy màn hình, ẩn logo (đã có tab Trang chủ). */
export function CompactNav() {
  return (
    // Màn rộng: dính sát mép trên khung thông tin khi cuộn (top âm bù phần padding của khung); nền + lề âm để nội dung trượt khuất bên dưới
    <div className="flex items-center gap-3 lg:sticky lg:-top-4 lg:z-10 lg:-mx-4 lg:-mt-4 lg:bg-bg/95 lg:px-4 lg:pb-3 lg:pt-4 lg:backdrop-blur xl:-top-5 xl:-mx-5 xl:-mt-5 xl:px-5 xl:pt-5">
      <Link to="/" aria-label="Em khám phá Lịch sử và Địa lí Việt Nam – Trang chủ" className="hidden lg:block shrink-0">
        <span className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-400 shadow-md">
          <BookOpen aria-hidden className="size-7 text-white" />
          <MapIcon aria-hidden className="absolute -right-1 -top-1 size-5 rounded-md bg-sky-500 p-0.5 text-white" />
        </span>
      </Link>
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-[1200] border-t border-line bg-surface/95 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.375rem)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur lg:static lg:z-auto lg:min-w-0 lg:flex-1 lg:rounded-2xl lg:border lg:bg-surface lg:p-1 lg:shadow-sm lg:backdrop-blur-none"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 lg:max-w-none">
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
