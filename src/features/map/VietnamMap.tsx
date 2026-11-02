// Bản đồ Việt Nam bằng Leaflet + GeoJSON tĩnh, không dùng lớp nền trực tuyến.
// File này được lazy-load: Leaflet và CSS của nó chỉ tải khi mở trang bản đồ.
import L, { type GeoJSON as GeoJSONLayer, type LatLngBoundsExpression, type Layer, type PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GeoJSON, MapContainer, Marker, useMap } from 'react-leaflet'
import { ErrorState, LoadingState } from '../../components/ui/states'
import type { RegionMeta } from '../../types/content'
import { geoLoader, type AreaCollection, type LabelCollection, type ProvinceFeatureProps, type RegionFeatureProps } from './geo'

// Khung nhìn toàn quốc, gồm cả Hoàng Sa và Trường Sa
const VIETNAM_BOUNDS: LatLngBoundsExpression = [
  [7.0, 101.5],
  [23.6, 118.2],
]

export interface VietnamMapProps {
  regions: RegionMeta[]
  selectedRegionId: string | null
  selectedProvinceId: string | null
  onSelectRegion(id: string): void
  onSelectProvince(id: string | null): void
}

type Loaded = { regions: AreaCollection<RegionFeatureProps>; provinces: AreaCollection<ProvinceFeatureProps>; labels: LabelCollection }

function useMapData() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'ready'; data: Loaded }>({
    status: 'loading',
  })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    Promise.all([geoLoader.loadRegions(), geoLoader.loadProvinces(), geoLoader.loadLabels()]).then(([r, p, l]) => {
      if (cancelled) return
      setState(r.ok && p.ok && l.ok ? { status: 'ready', data: { regions: r.data, provinces: p.data, labels: l.data } } : { status: 'error' })
    })
    return () => {
      cancelled = true
    }
  }, [attempt])
  return { state, retry: () => setAttempt((n) => n + 1) }
}

const cssColor = (token: string | undefined) =>
  token ? getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim() || '#94a3b8' : '#94a3b8'

function regionStyle(color: string, selected: boolean, dimmed: boolean): PathOptions {
  // Viền cùng màu vùng để các đảo nhỏ (Hoàng Sa, Trường Sa) vẫn thấy rõ màu; vùng đang chọn viền đậm
  return {
    color: selected ? '#1e293b' : color,
    weight: selected ? 2.5 : 1,
    fillColor: color,
    fillOpacity: dimmed ? 0.25 : selected ? 0.35 : 0.75,
  }
}

type PathWithFeature<P> = L.Path & { feature?: GeoJSON.Feature<GeoJSON.Geometry, P> }

function RegionsLayer({ data, regions, selectedRegionId, onSelectRegion }: { data: AreaCollection<RegionFeatureProps> } & Pick<VietnamMapProps, 'regions' | 'selectedRegionId' | 'onSelectRegion'>) {
  const map = useMap()
  const layerRef = useRef<GeoJSONLayer>(null)
  const colorOf = useCallback((id: string) => cssColor(regions.find((r) => r.id === id)?.color), [regions])
  const nameOf = useCallback((id: string) => regions.find((r) => r.id === id)?.name ?? id, [regions])
  const select = useRef(onSelectRegion)
  select.current = onSelectRegion

  // React Leaflet gọi lại setStyle khi prop style đổi → style là hàm ổn định, chỉ đổi khi vùng chọn đổi
  const styleFor = useCallback(
    (id: string): PathOptions =>
      regionStyle(colorOf(id), id === selectedRegionId, selectedRegionId !== null && id !== selectedRegionId),
    [colorOf, selectedRegionId],
  )
  const styleRef = useRef(styleFor)
  styleRef.current = styleFor
  const style = useCallback((f?: GeoJSON.Feature<GeoJSON.Geometry, RegionFeatureProps>) => (f ? styleFor(f.properties.regionId) : {}), [styleFor])

  useEffect(() => {
    if (selectedRegionId === null) {
      map.fitBounds(VIETNAM_BOUNDS)
      return
    }
    layerRef.current?.eachLayer((l) => {
      if (l instanceof L.Polygon && (l as PathWithFeature<RegionFeatureProps>).feature?.properties.regionId === selectedRegionId) {
        map.fitBounds(l.getBounds(), { padding: [24, 24] })
      }
    })
  }, [selectedRegionId, map])

  const onEachFeature = (feature: GeoJSON.Feature<GeoJSON.Geometry, RegionFeatureProps>, layer: Layer) => {
    const id = feature.properties.regionId
    layer.bindTooltip(nameOf(id), { sticky: true, className: 'map-tooltip' })
    layer.on({
      click: () => select.current(id),
      mouseover: (e) => (e.target as L.Path).setStyle({ weight: 3 }),
      mouseout: (e) => (e.target as L.Path).setStyle(styleRef.current(id)),
    })
  }

  return <GeoJSON ref={layerRef} data={data} style={style} onEachFeature={onEachFeature} />
}

function ProvincesLayer({ data, regionId, selectedProvinceId, onSelectProvince }: { data: AreaCollection<ProvinceFeatureProps>; regionId: string } & Pick<VietnamMapProps, 'selectedProvinceId' | 'onSelectProvince'>) {
  const select = useRef(onSelectProvince)
  select.current = onSelectProvince
  const filtered = useMemo<AreaCollection<ProvinceFeatureProps>>(
    () => ({ ...data, features: data.features.filter((f) => f.properties.regionId === regionId) }),
    [data, regionId],
  )
  const style = useCallback(
    (f?: GeoJSON.Feature<GeoJSON.Geometry, ProvinceFeatureProps>): PathOptions => {
      const selected = f?.properties.provinceId === selectedProvinceId
      return {
        color: '#1e293b',
        weight: selected ? 2.5 : 1,
        dashArray: selected ? undefined : '4 3',
        fillColor: '#f59e0b',
        fillOpacity: selected ? 0.55 : 0,
      }
    },
    [selectedProvinceId],
  )

  return (
    <GeoJSON
      key={regionId}
      data={filtered}
      style={style}
      onEachFeature={(feature, layer) => {
        layer.bindTooltip(feature.properties.name, { sticky: true, className: 'map-tooltip' })
        layer.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          select.current(feature.properties.provinceId)
        })
      }}
    />
  )
}

function Labels({ data }: { data: LabelCollection }) {
  return data.features.map((f) => {
    const [lng, lat] = f.geometry.coordinates
    if (lng === undefined || lat === undefined) return null
    const cls = f.properties.kind === 'sea' ? 'map-label map-label-sea' : 'map-label'
    return (
      <Marker
        key={f.properties.name}
        position={[lat, lng]}
        interactive={false}
        keyboard={false}
        icon={L.divIcon({ className: cls, html: `<span>${f.properties.name}</span>`, iconSize: [0, 0] })}
      />
    )
  })
}

function Controls() {
  const map = useMap()
  const btn =
    'inline-flex size-11 items-center justify-center rounded-xl bg-surface text-ink shadow-md hover:bg-primary-soft focus-visible:outline-3'
  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
      <button type="button" aria-label="Phóng to" className={btn} onClick={() => map.zoomIn()}>
        <Plus aria-hidden className="size-5" />
      </button>
      <button type="button" aria-label="Thu nhỏ" className={btn} onClick={() => map.zoomOut()}>
        <Minus aria-hidden className="size-5" />
      </button>
      <button type="button" aria-label="Xem toàn bộ bản đồ" className={btn} onClick={() => map.fitBounds(VIETNAM_BOUNDS)}>
        <RotateCcw aria-hidden className="size-5" />
      </button>
    </div>
  )
}

export default function VietnamMap(props: VietnamMapProps) {
  const { state, retry } = useMapData()

  if (state.status === 'loading') return <LoadingState label="Đang tải bản đồ…" />
  if (state.status === 'error') {
    return (
      <ErrorState
        title="Chưa tải được bản đồ"
        description="Em vẫn có thể chọn vùng trong danh sách bên dưới."
        onRetry={retry}
      />
    )
  }

  const { data } = state
  return (
    <div className="relative">
      <MapContainer
        bounds={VIETNAM_BOUNDS}
        maxBounds={[
          [3, 95],
          [27, 123],
        ]}
        minZoom={4}
        maxZoom={10}
        zoomSnap={0.25}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-[60vh] min-h-[420px] w-full rounded-card bg-sea lg:h-[calc(100vh-11rem)]"
        aria-label="Bản đồ các vùng địa lí Việt Nam"
      >
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
        <Controls />
      </MapContainer>
      <p className="mt-1 text-right text-xs text-muted">
        Ranh giới: vietnamese-provinces-database (MIT), đã đơn giản hoá để hiển thị.
      </p>
    </div>
  )
}
