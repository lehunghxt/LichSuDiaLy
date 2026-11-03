import { BookOpen, Map as MapIcon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-2xl px-4 text-base font-semibold transition-colors xl:px-5 xl:text-lg',
    isActive ? 'bg-primary text-white shadow-md' : 'border border-line bg-surface text-ink shadow-sm hover:bg-primary-soft',
  ].join(' ')
}

/** Dãy núi trang trí góc phải header (thuần trang trí) */
function Mountains() {
  return (
    <svg aria-hidden viewBox="0 0 320 80" className="pointer-events-none absolute bottom-0 right-0 hidden h-20 w-80 2xl:block">
      <path d="M0 80 L70 40 L110 60 L170 15 L230 55 L270 35 L320 60 L320 80 Z" fill="#86efac" />
      <path d="M150 30 L170 15 L190 32 L178 28 L170 36 L162 28 Z" fill="#fff" />
      <path d="M40 80 L120 50 L200 70 L260 48 L320 72 L320 80 Z" fill="#4ade80" />
      <rect x="236" y="44" width="4" height="12" fill="#92400e" />
      <path d="M238 24 L248 46 L228 46 Z" fill="#15803d" />
    </svg>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-[1100] overflow-hidden bg-surface/95 shadow-[0_4px_20px_rgb(15_23_42/0.06)] backdrop-blur">
      <div className="relative mx-auto flex max-w-[1680px] items-center gap-6 px-4 py-3 lg:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="relative flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-400 shadow-md">
            <BookOpen aria-hidden className="size-8 text-white" />
            <MapIcon aria-hidden className="absolute -right-1 -top-1 size-6 rounded-md bg-sky-500 p-0.5 text-white" />
          </span>
          <span className="whitespace-nowrap text-lg font-bold leading-tight text-[#1e293b] xl:text-xl">
            Em khám phá
            <span className="block">Lịch sử và Địa lí Việt Nam</span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-3">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={navClass}>
                  <Icon aria-hidden className="size-6" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div aria-hidden className="hidden w-64 2xl:block" />
        <Mountains />

        <button
          type="button"
          className="ml-auto inline-flex size-12 items-center justify-center rounded-full hover:bg-primary-soft lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Đóng menu' : 'Mở menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Menu điện thoại" className="border-t border-line px-4 pb-4 lg:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={navClass} onClick={() => setOpen(false)}>
                  <Icon aria-hidden className="size-5" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
