import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { LoadingState } from '../components/ui/states'
import { itemSlug, topicSearch } from '../features/content/links'
import { getItemsByCategory, repository } from '../features/content/repository'
import { TopicModal } from '../features/content/TopicModal'
import { useRegionContent } from '../features/content/useRegionContent'
import { MapInfoPanel } from '../features/map/MapInfoPanel'
import { RegionList } from '../features/map/RegionList'
import { useProgress } from '../features/progress/useProgress'
import { TOPIC_CATEGORIES, type TopicCategory } from '../types/content'

const VietnamMap = lazy(() => import('../features/map/VietnamMap'))

const isTopic = (v: string | null): v is TopicCategory => TOPIC_CATEGORIES.some((c) => c === v)

export default function MapPage() {
  const { regionId } = useParams()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const regions = repository.getRegions()
  const region = regions.find((r) => r.id === regionId) ?? null
  const [provinceId, setProvinceId] = useState<string | null>(null)
  const content = useRegionContent(region?.status === 'active' ? region.id : undefined)
  const { markRegionVisited, markItemViewed } = useProgress()

  const topicParam = params.get('chu-de')
  const topic = isTopic(topicParam) ? topicParam : null
  const slugParam = params.get('muc')
  const modalOpen = topic !== null && content.status === 'ready'
  const shownItem = modalOpen
    ? (getItemsByCategory(content.content, topic).find((i) => itemSlug(i.id) === slugParam) ??
      getItemsByCategory(content.content, topic)[0])
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
  const openTopic = (category: TopicCategory, slug: string | null) =>
    navigate({ search: topicSearch(category, slug) }, { replace: modalOpen })
  const closeTopic = () => navigate({ search: '' }, { replace: true })

  return (
    <div>
      <h1 className="sr-only">Bản đồ khám phá</h1>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(480px,1fr)]">
        <div className="relative overflow-hidden rounded-card border-4 border-white bg-sea shadow-[0_8px_30px_rgb(15_23_42/0.08)]">
          <Suspense fallback={<LoadingState label="Đang tải bản đồ…" />}>
            <VietnamMap
              regions={regions}
              selectedRegionId={region?.id ?? null}
              selectedProvinceId={provinceId}
              onSelectRegion={selectRegion}
              onSelectProvince={setProvinceId}
            />
          </Suspense>
          <div className="absolute left-4 top-4 z-[1000]">
            <RegionList regions={regions} selectedId={region?.id ?? null} onSelect={selectRegion} />
          </div>
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <MapInfoPanel
            region={region}
            regionIdFromUrl={regionId}
            content={content}
            provinceId={provinceId}
            onBack={() => navigate('/ban-do')}
            onOpen={openTopic}
          />
        </div>
      </div>
      {modalOpen && (
        <TopicModal content={content.content} category={topic} itemSlug={slugParam} onSelect={openTopic} onClose={closeTopic} />
      )}
    </div>
  )
}
