import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CompactNav } from '../components/layout/CompactNav'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { LoadingState } from '../components/ui/states'
import { itemSlug, topicSearch } from '../features/content/links'
import { findTopic, isSection, legacyTarget, topicOfItem } from '../features/content/outlineNav'
import { repository } from '../features/content/repository'
import { SectionModal } from '../features/content/SectionModal'
import { useRegionContent } from '../features/content/useRegionContent'
import { useRegionOutline } from '../features/content/useRegionOutline'
import { useRegionImages } from '../features/images/useRegionImages'
import { MapInfoPanel } from '../features/map/MapInfoPanel'
import { RegionList } from '../features/map/RegionList'
import { useProgress } from '../features/progress/useProgress'
import type { ContentItem, SectionId } from '../types/content'

const VietnamMap = lazy(() => import('../features/map/VietnamMap'))

export default function MapPage() {
  const { regionId } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const regions = repository.getRegions()
  const region = regions.find((r) => r.id === regionId) ?? null
  const [provinceId, setProvinceId] = useState<string | null>(null)
  const content = useRegionContent(region?.status === 'active' ? region.id : undefined)
  const images = useRegionImages(region?.id)
  const outline = useRegionOutline(region?.id)
  const { markRegionVisited, markItemsViewed } = useProgress()

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

  // Đổi vùng thì bỏ chọn tỉnh
  useEffect(() => setProvinceId(null), [regionId])

  useEffect(() => {
    if (region?.status === 'active') markRegionVisited(region.id)
  }, [region, markRegionVisited])

  // Mở một mục dàn ý: em đã xem mọi mục nội dung hiện trong đó
  const shownKey = modalOpen ? topicItemIds.join(' ') : ''
  useEffect(() => {
    if (shownKey) markItemsViewed(shownKey.split(' '))
  }, [shownKey, markItemsViewed])

  const selectRegion = (id: string) => navigate(`/ban-do/${id}`)
  // Mở modal thêm một mục lịch sử (nút Back của trình duyệt đóng modal); đổi mục bên trong thì thay thế
  const openTopic = (s: SectionId, topicId: string | null, slug?: string | null) =>
    navigate({ search: topicSearch(s, topicId ?? (outline ? (findTopic(outline, s, null)?.id ?? null) : null), slug) }, { replace: modalOpen })
  const openItem = (item: Pick<ContentItem, 'id' | 'section'>) => {
    const at = outline ? topicOfItem(outline, item.id) : null
    openTopic(at?.section ?? item.section, at?.topicId ?? null, itemSlug(item.id))
  }
  const closeTopic = () => navigate({ search: '' }, { replace: true })

  return (
    <>
      <h1 className="sr-only">Bản đồ khám phá</h1>
      <div className="grid lg:h-dvh lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div data-map-frame className="relative h-[65vh] overflow-hidden bg-sea lg:h-full">
          <Suspense fallback={<LoadingState label="Đang tải bản đồ…" />}>
            <VietnamMap
              regions={regions}
              selectedRegionId={region?.id ?? null}
              selectedProvinceId={provinceId}
              onSelectRegion={selectRegion}
              onSelectProvince={setProvinceId}
            />
          </Suspense>
          <div data-map-legend className="absolute left-4 top-4 z-[1000]">
            <RegionList regions={regions} selectedId={region?.id ?? null} onSelect={selectRegion} />
          </div>
        </div>
        <aside aria-label="Thông tin bản đồ" className="flex flex-col gap-5 bg-bg p-4 lg:overflow-y-auto lg:overscroll-contain xl:p-5">
          <CompactNav />
          <MapInfoPanel
            region={region}
            regionIdFromUrl={regionId}
            content={content}
            images={images}
            outline={outline}
            provinceId={provinceId}
            onBack={() => navigate('/ban-do')}
            onClearProvince={() => setProvinceId(null)}
            onOpenTopic={openTopic}
            onOpenItem={openItem}
          />
          <p className="mt-auto text-center text-xs text-muted">
            Nội dung bám theo SGK Lịch sử và Địa lí 4.{' '}
            <Link to="/nguon-anh" className="font-semibold text-primary hover:underline">
              Nguồn ảnh
            </Link>
          </p>
        </aside>
      </div>
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
