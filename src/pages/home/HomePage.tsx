import summary from 'virtual:home-summary'
import { repository } from '../../features/content'
import { ByDevice } from '../../components/layout/ByDevice'
import { DesktopHome } from './Home.desktop'
import { MobileHome } from './Home.mobile'
import { TabletHome } from './Home.tablet'
import type { HomeView } from './view'

/** Trang chủ: lấy dữ liệu một lần, mỗi thiết bị một bố cục (pages/home/*Home.tsx) */
export default function HomePage() {
  const view: HomeView = { regions: repository.getRegions(), summary }

  return <ByDevice mobile={<MobileHome view={view} />} tablet={<TabletHome view={view} />} desktop={<DesktopHome view={view} />} />
}
