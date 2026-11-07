// Các mảnh của khung trang (header, menu, chân trang), dùng chung cho mọi thiết bị. Không chứa lớp responsive:
// file bố cục của từng thiết bị chọn kiểu qua prop hoặc thêm lớp qua className.
import { BookOpen, Map as MapIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { NAV_ITEMS } from '../navItems'

/** Logo + tên trang, dẫn về Trang chủ. compact: biểu tượng và chữ nhỏ hơn (điện thoại) */
export function SiteLogo({ compact = false, titleClassName = '' }: { compact?: boolean; titleClassName?: string }) {
  return (
    <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-400 shadow-md ${compact ? 'size-11' : 'size-14'}`}
      >
        <BookOpen aria-hidden className={`text-white ${compact ? 'size-6' : 'size-8'}`} />
        <MapIcon aria-hidden className="absolute -right-1 -top-1 size-5 rounded-md bg-sky-500 p-0.5 text-white" />
      </span>
      <span className={`font-bold leading-tight text-[#1e293b] ${compact ? 'text-base' : 'whitespace-nowrap text-lg'} ${titleClassName}`}>
        Em khám phá
        <span className="block">Lịch sử và Địa lí Việt Nam</span>
      </span>
    </Link>
  )
}

interface NavPillsProps {
  /** row: một hàng ngang; column: danh sách dọc (trong menu) */
  layout: 'row' | 'column'
  /** Lớp thêm cho từng nút (file bố cục chỉnh cỡ chữ, lề theo thiết bị) */
  pillClassName?: string
  onNavigate?(): void
}

/** Các trang chính dạng nút bo tròn; trang đang mở tô màu */
export function NavPills({ layout, pillClassName = '', onNavigate }: NavPillsProps) {
  return (
    <ul className={layout === 'row' ? 'flex items-center gap-3' : 'flex flex-col gap-2'}>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-2xl px-4 text-base font-semibold transition-colors',
                layout === 'column' ? 'w-full' : '',
                isActive ? 'bg-primary text-white shadow-md' : 'border border-line bg-surface text-ink shadow-sm hover:bg-primary-soft',
                pillClassName,
              ].join(' ')
            }
          >
            <Icon aria-hidden className="size-6" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

/** Link tới hai trang nguồn */
export function SourceLinks({ onNavigate }: { onNavigate?(): void }) {
  return (
    <>
      <Link to="/nguon-tham-khao" onClick={onNavigate} className="font-semibold text-primary hover:underline">
        Nguồn tham khảo
      </Link>
      {' · '}
      <Link to="/nguon-anh" onClick={onNavigate} className="font-semibold text-primary hover:underline">
        Nguồn ảnh
      </Link>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface px-4 py-5 text-center text-sm text-muted">
      Nội dung học tập bám theo SGK Lịch sử và Địa lí 4. Tiến độ chỉ lưu trên trình duyệt này. <SourceLinks />
    </footer>
  )
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-nav focus:rounded-full focus:bg-surface focus:px-4 focus:py-2"
    >
      Bỏ qua tới nội dung chính
    </a>
  )
}

/** Dãy núi trang trí góc phải header (thuần trang trí) */
export function Mountains({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 320 80" className={`pointer-events-none absolute bottom-0 right-0 h-20 w-80 ${className}`}>
      <path d="M0 80 L70 40 L110 60 L170 15 L230 55 L270 35 L320 60 L320 80 Z" fill="#86efac" />
      <path d="M150 30 L170 15 L190 32 L178 28 L170 36 L162 28 Z" fill="#fff" />
      <path d="M40 80 L120 50 L200 70 L260 48 L320 72 L320 80 Z" fill="#4ade80" />
      <rect x="236" y="44" width="4" height="12" fill="#92400e" />
      <path d="M238 24 L248 46 L228 46 Z" fill="#15803d" />
    </svg>
  )
}

/** Thanh header dính trên cùng (nền mờ, đổ bóng nhẹ) */
export const HEADER_BAR = 'sticky top-0 z-overlay overflow-hidden bg-surface/95 shadow-[0_4px_20px_rgb(15_23_42/0.06)] backdrop-blur'
