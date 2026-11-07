// Bản đồ Việt Nam bằng Leaflet + GeoJSON tĩnh, không dùng lớp nền trực tuyến.
// File này được lazy-load: Leaflet và CSS của nó chỉ tải khi mở trang bản đồ.
import 'leaflet/dist/leaflet.css'
import { MapContainer } from 'react-leaflet'
import { ErrorState, LoadingState } from '../../components/ui/states'
import type { RegionMeta } from '../../types/content'
import { MAP_MAX_BOUNDS } from './fit'
import { Labels } from './leaflet/Labels'
import { Controls, FitCountry } from './leaflet/MapControls'
import { ProvincesLayer } from './leaflet/ProvincesLayer'
import { RegionsLayer } from './leaflet/RegionsLayer'
import { useMapData } from './leaflet/useMapData'
import { VIETNAM_BOUNDS } from './leaflet/view'
import { LocationMarkers } from './LocationMarkers'
import type { Place } from './places'

export interface VietnamMapProps {
  regions: RegionMeta[]
  selectedRegionId: string | null
  selectedProvinceId: string | null
  onSelectRegion(id: string): void
  onSelectProvince(id: string | null): void
  /** Địa danh có toạ độ của vùng đang chọn */
  places: Place[]
  onOpenPlace(place: Place): void
}

export default function VietnamMap(props: VietnamMapProps) {
  const { state, retry } = useMapData()

  if (state.status === 'loading') return <LoadingState label="Đang tải bản đồ…" />
  if (state.status === 'error') {
    return <ErrorState title="Chưa tải được bản đồ" description="Em vẫn có thể chọn vùng trong bảng các vùng địa lí." onRetry={retry} />
  }

  const { data } = state
  return (
    <div className="relative h-full">
      <MapContainer
        bounds={VIETNAM_BOUNDS}
        maxBounds={MAP_MAX_BOUNDS}
        minZoom={4}
        maxZoom={10}
        zoomSnap={0.25}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full bg-sea"
        aria-label="Bản đồ các vùng địa lí Việt Nam"
      >
        {/* Đặt trước RegionsLayer: canh toàn quốc lúc mở trước, rồi mới phóng vào vùng đang chọn (màn xếp dọc) */}
        <FitCountry />
        <RegionsLayer
          data={data.regions}
          regions={props.regions}
          selectedRegionId={props.selectedRegionId}
          onSelectRegion={props.onSelectRegion}
        />
        {props.selectedRegionId && (
          <ProvincesLayer
            data={data.provinces}
            regionId={props.selectedRegionId}
            selectedProvinceId={props.selectedProvinceId}
            onSelectProvince={props.onSelectProvince}
          />
        )}
        <Labels data={data.labels} />
        {props.selectedRegionId && <LocationMarkers places={props.places} onOpen={props.onOpenPlace} />}
        <Controls />
      </MapContainer>
      <p className="pointer-events-none absolute bottom-2 right-4 z-[1000] max-w-[60%] text-right text-xs text-muted">
        Ranh giới: vietnamese-provinces-database (MIT), đã đơn giản hoá để hiển thị.
      </p>
    </div>
  )
}
