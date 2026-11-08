import { repository, useRegionContent, useRegionOutline } from '../features/content'
import { useDevice } from '../lib/device'
import { DesktopHome } from './home/DesktopHome'
import { MobileHome } from './home/MobileHome'
import { TabletHome } from './home/TabletHome'
import type { HomeView } from './home/view'

/** Trang chủ: lấy dữ liệu một lần, mỗi thiết bị một bố cục (pages/home/*Home.tsx) */
export default function HomePage() {
  const device = useDevice()
  const regions = repository.getRegions()
  const active = regions.find((r) => r.status === 'active')
  const content = useRegionContent(active?.id)
  const outline = useRegionOutline(active?.id)
  const view: HomeView = { content: content.status === 'ready' ? content.content : null, regionCount: regions.length, active, outline }

  if (device === 'mobile') return <MobileHome view={view} />
  if (device === 'tablet') return <TabletHome view={view} />
  return <DesktopHome view={view} />
}
