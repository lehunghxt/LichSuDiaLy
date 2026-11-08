import { Suspense } from 'react'
import { Outlet, useMatch } from 'react-router'
import { ProgressProvider } from '../../features/progress'
import { ByDevice } from '../../components/layout/ByDevice'
import { LoadingState } from '../../components/ui/states'
import { DesktopSiteLayout } from './SiteLayout.desktop'
import { MobileSiteLayout } from './SiteLayout.mobile'
import { TabletSiteLayout } from './SiteLayout.tablet'

/** Khung trang: mỗi thiết bị một bố cục (header, menu, chân trang). Trang bản đồ tự lo bố cục toàn màn hình */
export function AppLayout() {
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
  return (
    <ProgressProvider>
      <ByDevice
        mobile={<MobileSiteLayout>{page}</MobileSiteLayout>}
        tablet={<TabletSiteLayout>{page}</TabletSiteLayout>}
        desktop={<DesktopSiteLayout>{page}</DesktopSiteLayout>}
      />
    </ProgressProvider>
  )
}
