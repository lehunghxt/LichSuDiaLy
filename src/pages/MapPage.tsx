import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CompactNav } from '../components/layout/CompactNav'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { LoadingState } from '../components/ui/states'
import { itemSlug, topicSearch } from '../features/content/links'
import { getItemsBySection, repository } from '../features/content/repository'
import { TopicModal } from '../features/content/TopicModal'
import { useRegionContent } from '../features/content/useRegionContent'
import { useRegionImages } from '../features/images/useRegionImages'
import { MapInfoPanel } from '../features/map/MapInfoPanel'
import { RegionList } from '../features/map/RegionList'
import { useProgress } from '../features/progress/useProgress'
import { SECTIONS, type SectionId } from '../types/content'

const VietnamMap = lazy(() => import('../features/map/VietnamMap'))

const isTopic = (v: string | null): v is SectionId => SECTIONS.some((c) => c === v)

export default function MapPage() {
  const { regionId } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const regions = repository.getRegions()
  const region = regions.find((r) => r.id === regionId) ?? null
  const [provinceId, setProvinceId] = useState<string | null>(null)
  const content = useRegionContent(region?.status === 'active' ? region.id : undefined)
  const images = useRegionImages(region?.id)
  const { markRegionVisited, markItemViewed } = useProgress()

  const topicParam = params.get('chu-de')
  const topic = isTopic(topicParam) ? topicParam : null
  const slugParam = params.get('muc')
  const modalOpen = topic !== null && content.status === 'ready'
  const shownItem = modalOpen
    ? (getItemsBySection(content.content, topic).find((i) => itemSlug(i.id) === slugParam) ??
      getItemsBySection(content.content, topic)[0])
    : undefined

  // Đổi vùng thì bỏ chọn tỉnh
  useEffect(() => setProvinceId(null), [regionId])

  useEffect(() => {
    if (region?.status === 'active') markRegionVisited(region.id)
  }, [region, markRegionVisited])

  const shownItemId = shownItem?.id
  useEffect(() => {
    if (shownItemId) markItemViewed(shownItemId)
  }, [shownItemId, markItemViewed])

  const selectRegion = (id: string) => navigate(`/ban-do/${id}`)
  // Mở modal thêm một mục lịch sử (nút Back của trình duyệt đóng modal); đổi mục bên trong thì thay thế
  const openTopic = (section: SectionId, slug: string | null) =>
    navigate({ search: topicSearch(section, slug) }, { replace: modalOpen })
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
            provinceId={provinceId}
            onBack={() => navigate('/ban-do')}
            onClearProvince={() => setProvinceId(null)}
            onOpen={openTopic}
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
        <TopicModal content={content.content} images={images} section={topic} itemSlug={slugParam} onSelect={openTopic} onClose={closeTopic} />
      )}
    </>
  )
}
