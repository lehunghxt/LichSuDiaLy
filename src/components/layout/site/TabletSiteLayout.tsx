import { Menu, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { HEADER_BAR, NavPills, SiteFooter, SiteLogo, SkipLink } from './parts'

/** Máy tính bảng: header có logo và nút ☰; menu thả xuống ngay dưới header, các trang xếp thành hàng */
export function TabletSiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header className={HEADER_BAR}>
        <div className="flex items-center gap-4 px-6 py-3">
          <SiteLogo />
          <button
            type="button"
            className="ml-auto inline-flex size-12 items-center justify-center rounded-full hover:bg-primary-soft"
            aria-expanded={open}
            aria-controls="tablet-menu"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
          </button>
        </div>
        {open && (
          <nav id="tablet-menu" aria-label="Menu" className="border-t border-line px-6 py-3">
            <div className="flex flex-wrap gap-3">
              <NavPills layout="row" onNavigate={() => setOpen(false)} pillClassName="" />
            </div>
          </nav>
        )}
      </header>
      <main id="main" className="w-full flex-1 px-6 py-5">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
