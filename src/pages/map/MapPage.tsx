import { Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Marquee } from '../../components/ui/Marquee'
import { LoadingState } from '../../components/ui/states'
import {
  findTopic,
  isSection,
  itemSlug,
  legacyTarget,
  repository,
  SectionModal,
  topicOfItem,
  topicSearch,
  useRegionContent,
  useRegionOutline,
} from '../../features/content'
import { useRegionImages } from '../../features/images'
import { MapInfoPanel, placesOf, RegionList, VietnamMap } from '../../features/map'
import { provinceRegionId } from '../../lib/provinces'
import type { Snap } from '../../components/sheet/SnapSheet'
import { useProgress } from '../../features/progress'
import { ByDevice } from '../../components/layout/ByDevice'
import type { ContentItem, SectionId } from '../../types/content'
import { DesktopMapLayout } from './MapLayout.desktop'
import { MobileMapLayout } from './MapLayout.mobile'
import { TabletMapLayout } from './MapLayout.tablet'

const SOVEREIGNTY = 'Hoàng Sa, Trường Sa là của Việt Nam!'

export default function MapPage() {
  const { regionId } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const regions = repository.getRegions()
  const region = regions.find((r) => r.id === regionId) ?? null
  const content = useRegionContent(region?.status === 'active' ? region.id : undefined)
  const images = useRegionImages(region?.id)
  const outline = useRegionOutline(region?.id)
  const { markRegionVisited, markItemsViewed } = useProgress()

  // Tỉnh đang xem nằm trong URL (?tinh=<id>): gửi link được, nút Back của trình duyệt về tỉnh trước đó.
  // Chỉ nhận tỉnh thuộc vùng đang xem
  const provinceParam = params.get('tinh')
  const provinceId = provinceParam && region && provinceRegionId(provinceParam) === region.id ? provinceParam : null

  const sectionParam = params.get('phan')
  const section = isSection(sectionParam) ? sectionParam : null
  const topic = section && outline ? findTopic(outline, section, params.get('muc')) : undefined
  // Vùng chưa có nội dung vẫn mở được modal (mọi mục "đang cập nhật")
  const items = content.status === 'ready' ? content.content.items : []
  const contentSettled = region?.status === 'coming_soon' || content.status === 'ready'
  const modalOpen = section !== null && outline !== null && region !== null && contentSettled
  const topicItemIds = topic ? items.filter((i) => topic.itemIds.includes(i.id)).map((i) => i.id) : []

  // Link cũ ?chu-de=<chủ đề>&muc=<slug mục> → vị trí tương ứng trong dàn ý
  const legacyTopic = params.get('chu-de')
  const legacySlug = legacyTopic === null ? null : params.get('muc')
  useEffect(() => {
    if (legacyTopic === null || !outline) return
    const t = legacyTarget(outline, legacyTopic, legacySlug)
    navigate({ search: t ? topicSearch(t.section, t.topicId, t.slug) : '' }, { replace: true })
  }, [legacyTopic, legacySlug, outline, navigate])

  // Điện thoại: mức mở của bottom sheet thông tin vùng
  const [snap, setSnap] = useState<Snap>('half')

  // Đổi vùng (link mới không mang ?tinh nên tỉnh cũng bỏ chọn): mở lại bottom sheet ở mức nửa màn hình
  useEffect(() => {
    setSnap('half')
  }, [regionId])
  // Chọn tỉnh khi tấm đang thu gọn: mở lên để em thấy thẻ tỉnh
  const selectProvince = (id: string | null) => {
    if (id === provinceId) return
    navigate({ search: id ? `?${new URLSearchParams({ tinh: id }).toString()}` : '' })
    if (id) setSnap((s) => (s === 'peek' ? 'half' : s))
  }

  useEffect(() => {
    if (region?.status === 'active') markRegionVisited(region.id)
  }, [region, markRegionVisited])

  // Mở một mục dàn ý: em đã xem mọi mục nội dung hiện trong đó
  const shownKey = modalOpen ? topicItemIds.join(' ') : ''
  useEffect(() => {
    if (shownKey) markItemsViewed(shownKey.split(' '))
  }, [shownKey, markItemsViewed])

  const selectRegion = (id: string) => navigate(`/ban-do/${id}`)
  // Giữ tỉnh đang xem khi mở, đóng modal dàn ý
  const keepProvince = (search: string) => {
    if (!provinceId) return search
    const next = new URLSearchParams(search)
    next.set('tinh', provinceId)
    return `?${next.toString()}`
  }
  // Mở modal thêm một mục lịch sử (nút Back của trình duyệt đóng modal); đổi mục bên trong thì thay thế
  const openTopic = (s: SectionId, topicId: string | null, slug?: string | null) =>
    navigate(
      { search: keepProvince(topicSearch(s, topicId ?? (outline ? (findTopic(outline, s, null)?.id ?? null) : null), slug)) },
      { replace: modalOpen },
    )
  const openItem = (item: Pick<ContentItem, 'id' | 'section'>) => {
    const at = outline ? topicOfItem(outline, item.id) : null
    openTopic(at?.section ?? item.section, at?.topicId ?? null, itemSlug(item.id))
  }
  const closeTopic = () => navigate({ search: keepProvince('') }, { replace: true })

  const map = (
    <Suspense fallback={<LoadingState label="Đang tải bản đồ…" />}>
      <VietnamMap
        regions={regions}
        selectedRegionId={region?.id ?? null}
        selectedProvinceId={provinceId}
        onSelectRegion={selectRegion}
        onSelectProvince={selectProvince}
        places={placesOf(items)}
        onOpenPlace={openItem}
      />
    </Suspense>
  )
  // Dải chip chọn vùng và dòng chữ chạy bên dưới; cả hai nằm trong khung chú giải nên khi canh bản đồ đều được chừa chỗ
  const chips = (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <RegionList regions={regions} selectedId={region?.id ?? null} onSelect={selectRegion} />
      <Marquee text={SOVEREIGNTY} />
    </div>
  )
  const panel = (
    <>
      <MapInfoPanel
        region={region}
        regions={regions}
        onSelectRegion={selectRegion}
        regionIdFromUrl={regionId}
        content={content}
        images={images}
        outline={outline}
        provinceId={provinceId}
        onBack={() => navigate('/ban-do')}
        onClearProvince={() => selectProvince(null)}
        onOpenTopic={openTopic}
        onOpenItem={openItem}
      />
      <p className="mt-auto text-center text-xs text-muted">
        Nội dung bám theo SGK Lịch sử và Địa lý 4.{' '}
        <Link to="/nguon-tham-khao" className="font-semibold text-primary hover:underline">
          Nguồn tham khảo
        </Link>
        {' · '}
        <Link to="/nguon-anh" className="font-semibold text-primary hover:underline">
          Nguồn ảnh
        </Link>
      </p>
    </>
  )

  return (
    <>
      <h1 className="sr-only">Bản đồ khám phá</h1>
      <ByDevice
        mobile={<MobileMapLayout map={map} chips={chips} panel={panel} sheetOpen={regionId !== undefined} snap={snap} onSnap={setSnap} />}
        tablet={
          <TabletMapLayout
            map={map}
            chips={chips}
            panel={panel}
            panelOpen={regionId !== undefined}
            onClosePanel={() => navigate('/ban-do')}
          />
        }
        desktop={<DesktopMapLayout map={map} chips={chips} panel={panel} />}
      />
      {modalOpen && (
        <SectionModal
          region={region}
          outline={outline}
          items={items}
          images={images}
          section={section}
          topicId={topic?.id ?? null}
          itemSlug={params.get('bai')}
          onSelect={openTopic}
          onSelectItem={openItem}
          onClose={closeTopic}
        />
      )}
    </>
  )
}
