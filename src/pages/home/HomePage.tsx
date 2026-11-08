import { repository, useRegionContent, useRegionOutline } from '../../features/content'
import { ByDevice } from '../../components/layout/ByDevice'
import { DesktopHome } from './DesktopHome'
import { MobileHome } from './MobileHome'
import { TabletHome } from './TabletHome'
import type { HomeView } from './view'

/** Trang chủ: lấy dữ liệu một lần, mỗi thiết bị một bố cục (pages/home/*Home.tsx) */
export default function HomePage() {
  const regions = repository.getRegions()
  const active = regions.find((r) => r.status === 'active')
  const content = useRegionContent(active?.id)
  const outline = useRegionOutline(active?.id)
  const view: HomeView = { content: content.status === 'ready' ? content.content : null, regionCount: regions.length, active, outline }

  return <ByDevice mobile={<MobileHome view={view} />} tablet={<TabletHome view={view} />} desktop={<DesktopHome view={view} />} />
}
