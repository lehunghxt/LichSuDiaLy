import { Menu, X } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { SideDrawer } from '../../components/sheet/SideDrawer'
import { HEADER_BAR, NavPills, SiteFooter, SiteLogo, SkipLink, SourceLinks } from './parts'

/** Điện thoại: header gọn (logo + ☰); ☰ mở menu dạng thanh bên trượt ra từ mép phải */
export function MobileSiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header className={HEADER_BAR}>
        <div className="flex items-center gap-3 px-4 py-2.5">
          <SiteLogo compact />
          <button
            type="button"
            className="ml-auto inline-flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary-soft"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label="Mở menu"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden className="size-6" />
          </button>
        </div>
      </header>
      <main id="main" className="w-full flex-1 px-4 py-5">
        {children}
      </main>
      <SiteFooter />
      {open && (
        <SideDrawer label="Menu" onClose={close} initialFocusRef={closeRef}>
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <SiteLogo compact onNavigate={close} />
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Đóng menu"
              className="ml-auto grid size-11 shrink-0 place-items-center rounded-full bg-surface text-muted shadow-sm hover:bg-line hover:text-ink"
            >
              <X aria-hidden className="size-5" strokeWidth={2.5} />
            </button>
          </div>
          <nav aria-label="Menu" className="px-4 py-4">
            <NavPills layout="column" onNavigate={close} />
          </nav>
          <p className="mt-auto border-t border-line px-4 py-4 text-center text-sm text-muted">
            <SourceLinks onNavigate={close} />
          </p>
        </SideDrawer>
      )}
    </div>
  )
}
