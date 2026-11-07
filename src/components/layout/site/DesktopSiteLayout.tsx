import type { ReactNode } from 'react'
import { HEADER_BAR, Mountains, NavPills, SiteFooter, SiteLogo, SkipLink } from './parts'

/** Desktop: header có logo, menu ngang ở giữa, dãy núi trang trí (màn rất rộng); nội dung rộng tối đa 1680px */
export function DesktopSiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <header className={HEADER_BAR}>
        <div className="relative mx-auto flex max-w-[1680px] items-center gap-6 px-6 py-3">
          <SiteLogo titleClassName="xl:text-xl" />
          <nav aria-label="Điều hướng chính" className="mx-auto">
            <NavPills layout="row" pillClassName="xl:px-5 xl:text-lg" />
          </nav>
          <div aria-hidden className="hidden w-64 2xl:block" />
          <Mountains className="hidden 2xl:block" />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1680px] flex-1 px-6 py-5">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
