import { Compass, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems'

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold transition-colors',
    isActive ? 'bg-primary text-white' : 'text-ink hover:bg-primary-soft',
  ].join(' ')
}

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-[1100] border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <Compass aria-hidden className="size-8 text-accent" />
          <span className="leading-tight">
            Em khám phá
            <span className="block text-sm font-semibold text-secondary">Lịch sử & Địa lí</span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={navClass}>
                  <Icon aria-hidden className="size-5" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex size-12 items-center justify-center rounded-full hover:bg-primary-soft lg:hidden"
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
