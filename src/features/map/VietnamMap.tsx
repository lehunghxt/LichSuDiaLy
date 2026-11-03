// Bản đồ Việt Nam bằng Leaflet + GeoJSON tĩnh, không dùng lớp nền trực tuyến.
// File này được lazy-load: Leaflet và CSS của nó chỉ tải khi mở trang bản đồ.
import L, { type GeoJSON as GeoJSONLayer, type LatLngBoundsExpression, type Layer, type PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GeoJSON, MapContainer, Marker, useMap } from 'react-leaflet'
import { ErrorState, LoadingState } from '../../components/ui/states'
import type { RegionMeta } from '../../types/content'
import { geoLoader, type AreaCollection, type LabelCollection, type ProvinceFeatureProps, type RegionFeatureProps } from './geo'

// Khung nhìn toàn quốc, gồm cả Hoàng Sa và Trường Sa
const VIETNAM_BOUNDS: LatLngBoundsExpression = [
  [7.6, 102.0],
  [23.5, 117.9],
]

/** Canh toàn quốc, chừa chỗ cho bảng chú giải nổi góc trái (đo thật vì cỡ chữ đổi theo màn hình) */
function fitCountry(map: L.Map) {
  const legend = map.getContainer().closest('[data-map-frame]')?.querySelector<HTMLElement>('[data-map-legend]')
  const left = legend ? legend.offsetLeft + legend.offsetWidth + 8 : 12
  map.fitBounds(VIETNAM_BOUNDS, { paddingTopLeft: [left, 12], paddingBottomRight: [12, 12] })
}

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
  // Viền cùng màu vùng để các đảo nhỏ (Hoàng Sa, Trường Sa) vẫn thấy rõ màu; vùng đang chọn viền trắng dày
  return {
    color: selected ? '#ffffff' : color,
    weight: selected ? 4 : 1,
    fillColor: color,
    fillOpacity: selected ? 1 : dimmed ? 0.55 : 0.9,
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

  // Theo hình mẫu: giữ toàn quốc, vùng đang chọn có nhãn bong bóng phía trên
  useEffect(() => {
    if (!selectedRegionId) return
    let tooltip: L.Tooltip | null = null
    layerRef.current?.eachLayer((l) => {
      if (l instanceof L.Polygon && (l as PathWithFeature<RegionFeatureProps>).feature?.properties.regionId === selectedRegionId) {
        const b = l.getBounds()
        tooltip = L.tooltip({ permanent: true, direction: 'top', className: 'region-callout', offset: [0, -6] })
          .setLatLng([b.getNorth(), b.getCenter().lng])
          .setContent(nameOf(selectedRegionId))
        map.openTooltip(tooltip)
      }
    })
    return () => {
      if (tooltip) map.closeTooltip(tooltip)
    }
  }, [selectedRegionId, map, nameOf])

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
        color: '#4c1d95',
        weight: selected ? 2.5 : 0.8,
        dashArray: selected ? undefined : '4 3',
        fillColor: '#f59e0b',
        fillOpacity: selected ? 0.55 : 0,
      }
    },
    [selectedProvinceId],
  )

  const selected = filtered.features.find((f) => f.properties.provinceId === selectedProvinceId)
  // Nhãn tên tỉnh cố định ở tâm khung bao của tỉnh đang chọn
  const pin = useMemo(
    () =>
      selected
        ? {
            position: L.geoJSON(selected).getBounds().getCenter(),
            icon: L.divIcon({ className: 'province-pin', html: `<span>${selected.properties.name}</span>`, iconSize: [0, 0] }),
          }
        : null,
    [selected],
  )

  return (
    <>
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
      {pin && <Marker position={pin.position} icon={pin.icon} interactive={false} keyboard={false} zIndexOffset={1000} />}
    </>
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
        icon={L.divIcon({ className: cls, html: `<span>${f.properties.name.replace(' (', '<br>(')}</span>`, iconSize: [0, 0] })}
      />
    )
  })
}

function FitCountry() {
  const map = useMap()
  useEffect(() => {
    fitCountry(map)
    const scale = L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 160 }).addTo(map)
    return () => {
      scale.remove()
    }
  }, [map])
  return null
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
      <button type="button" aria-label="Xem toàn bộ bản đồ" className={`${btn} mt-2`} onClick={() => fitCountry(map)}>
        <LocateFixed aria-hidden className="size-5" />
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
        description="Em vẫn có thể chọn vùng trong bảng các vùng địa lí."
        onRetry={retry}
      />
    )
  }

  const { data } = state
  return (
    <div className="relative">
      <MapContainer
        bounds={VIETNAM_BOUNDS}
        // Rộng về phía tây: phần đó nằm dưới bảng chú giải khi canh toàn quốc
        maxBounds={[
          [3, 85],
          [27, 123],
        ]}
        minZoom={4}
        maxZoom={10}
        zoomSnap={0.25}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-[calc(100vh-8rem)] min-h-[640px] w-full rounded-card bg-sea"
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
        <FitCountry />
        <Controls />
      </MapContainer>
      <p className="pointer-events-none absolute bottom-2 right-4 z-[1000] text-xs text-muted">
        Ranh giới: vietnamese-provinces-database (MIT), đã đơn giản hoá để hiển thị.
      </p>
    </div>
  )
}
