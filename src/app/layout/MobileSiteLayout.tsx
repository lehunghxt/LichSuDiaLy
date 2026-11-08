import { Menu } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { BottomSheet } from '../../components/sheet/BottomSheet'
import { HEADER_BAR, NavPills, SiteFooter, SiteLogo, SkipLink, SourceLinks } from './parts'

/** Điện thoại: header gọn (logo + ☰); ☰ mở menu dạng bottom sheet */
export function MobileSiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
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
        <BottomSheet label="Menu" onClose={close}>
          <nav aria-label="Menu" className="px-4 pb-2">
            <NavPills layout="column" onNavigate={close} />
          </nav>
          <p className="px-4 pb-5 pt-2 text-center text-sm text-muted">
            <SourceLinks onNavigate={close} />
          </p>
        </BottomSheet>
      )}
    </div>
  )
}
