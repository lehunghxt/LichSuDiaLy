import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { LoadingState } from '../components/ui/states'
import { repository } from '../features/content/repository'
import { useRegionContent } from '../features/content/useRegionContent'
import { MapInfoPanel } from '../features/map/MapInfoPanel'
import { RegionList } from '../features/map/RegionList'
import { useProgress } from '../features/progress/useProgress'

const VietnamMap = lazy(() => import('../features/map/VietnamMap'))

export default function MapPage() {
  const { regionId } = useParams()
  const navigate = useNavigate()
  const regions = repository.getRegions()
  const region = regions.find((r) => r.id === regionId) ?? null
  const [provinceId, setProvinceId] = useState<string | null>(null)
  const content = useRegionContent(region?.status === 'active' ? region.id : undefined)
  const { markRegionVisited } = useProgress()

  // Đổi vùng thì bỏ chọn tỉnh
  useEffect(() => setProvinceId(null), [regionId])

  useEffect(() => {
    if (region?.status === 'active') markRegionVisited(region.id)
  }, [region, markRegionVisited])

  const selectRegion = (id: string) => navigate(`/ban-do/${id}`)

  return (
    <div>
      <h1 className="text-3xl font-bold">Bản đồ khám phá</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <div className="flex flex-col gap-4">
          <Suspense fallback={<LoadingState label="Đang tải bản đồ…" />}>
            <VietnamMap
              regions={regions}
              selectedRegionId={region?.id ?? null}
              selectedProvinceId={provinceId}
              onSelectRegion={selectRegion}
              onSelectProvince={setProvinceId}
            />
          </Suspense>
          <RegionList regions={regions} selectedId={region?.id ?? null} onSelect={selectRegion} />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <MapInfoPanel
            region={region}
            regionIdFromUrl={regionId}
            content={content}
            provinceId={provinceId}
            onBack={() => navigate('/ban-do')}
          />
        </div>
      </div>
    </div>
  )
}
