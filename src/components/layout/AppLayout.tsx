import { Suspense } from 'react'
import { Outlet, useMatch } from 'react-router'
import { ProgressProvider } from '../../features/progress/ProgressProvider'
import { useDevice } from '../../lib/device'
import { LoadingState } from '../ui/states'
import { DesktopSiteLayout } from './site/DesktopSiteLayout'
import { MobileSiteLayout } from './site/MobileSiteLayout'
import { TabletSiteLayout } from './site/TabletSiteLayout'

const SITE_LAYOUT = { mobile: MobileSiteLayout, tablet: TabletSiteLayout, desktop: DesktopSiteLayout }

/** Khung trang: mỗi thiết bị một bố cục (header, menu, chân trang). Trang bản đồ tự lo bố cục toàn màn hình */
export function AppLayout() {
  const device = useDevice()
  const fullScreen = useMatch('/ban-do/*') !== null
  const page = (
    <Suspense fallback={<LoadingState />}>
      <Outlet />
    </Suspense>
  )
  if (fullScreen) {
    return (
      <ProgressProvider>
        <main id="main" className="min-h-dvh">
          {page}
        </main>
      </ProgressProvider>
    )
  }
  const SiteLayout = SITE_LAYOUT[device]
  return (
    <ProgressProvider>
      <SiteLayout>{page}</SiteLayout>
    </ProgressProvider>
  )
}
