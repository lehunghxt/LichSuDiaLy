// Bản đồ Việt Nam bằng Leaflet + GeoJSON tĩnh, không dùng lớp nền trực tuyến.
// File này được lazy-load: Leaflet và CSS của nó chỉ tải khi mở trang bản đồ.
import L, { type GeoJSON as GeoJSONLayer, type LatLngBoundsExpression, type Layer, type PathOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GeoJSON, MapContainer, Marker, useMap } from 'react-leaflet'
import { ErrorState, LoadingState } from '../../components/ui/states'
import { useLatest } from '../../lib/useLatest'
import type { RegionMeta } from '../../types/content'
import { deviceOf } from '../../lib/device'
import { MAP_MAX_BOUNDS, countryPadding, regionPadding } from './fit'
import { bindHoverName } from './hoverName'
import { LocationMarkers } from './LocationMarkers'
import type { Place } from './places'
import {
  geoLoader,
  regionBounds,
  splitOffshore,
  type AreaCollection,
  type LabelCollection,
  type ProvinceFeatureProps,
  type RegionFeatureProps,
  type WithOffshore,
} from './geo'

// Khung nhìn toàn quốc, gồm cả Hoàng Sa và Trường Sa
const VIETNAM_BOUNDS: LatLngBoundsExpression = [
  [7.6, 102.0],
  [23.5, 117.9],
]

/** Canh toàn quốc, chừa chỗ cho bảng chú giải nổi góc trái (đo thật vì cỡ chữ đổi theo màn hình) */
function legendBox(map: L.Map) {
  const legend = map.getContainer().closest('[data-map-frame]')?.querySelector<HTMLElement>('[data-map-legend]')
  return legend ? { left: legend.offsetLeft, top: legend.offsetTop, width: legend.offsetWidth, height: legend.offsetHeight } : null
}

function fitCountry(map: L.Map) {
  const { clientHeight } = map.getContainer()
  map.fitBounds(VIETNAM_BOUNDS, countryPadding(deviceOf(window.innerWidth), clientHeight, legendBox(map)))
}

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
      setState(
        r.ok && p.ok && l.ok ? { status: 'ready', data: { regions: r.data, provinces: p.data, labels: l.data } } : { status: 'error' },
      )
    })
    return () => {
      cancelled = true
    }
  }, [attempt])
  return { state, retry: () => setAttempt((n) => n + 1) }
}

const cssColor = (token: string | undefined) =>
  token ? getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim() || '#94a3b8' : '#94a3b8'

function regionStyle(color: string, selected: boolean, dimmed: boolean, offshore = false): PathOptions {
  // Hoàng Sa, Trường Sa: không viền để các mảnh đảo, bãi đá giữ đúng kích thước
  if (offshore) return { stroke: false, fillColor: color, fillOpacity: selected ? 1 : dimmed ? 0.55 : 0.9 }
  // Viền cùng màu vùng để các đảo nhỏ (Hoàng Sa, Trường Sa) vẫn thấy rõ màu; vùng đang chọn viền trắng dày
  return {
    color: selected ? '#ffffff' : color,
    weight: selected ? 4 : 1,
    fillColor: color,
    fillOpacity: selected ? 1 : dimmed ? 0.55 : 0.9,
  }
}

type PathWithFeature<P> = L.Path & { feature?: GeoJSON.Feature<GeoJSON.Geometry, P> }

function RegionsLayer({
  data,
  regions,
  selectedRegionId,
  onSelectRegion,
}: { data: AreaCollection<RegionFeatureProps> } & Pick<VietnamMapProps, 'regions' | 'selectedRegionId' | 'onSelectRegion'>) {
  const map = useMap()
  const layerRef = useRef<GeoJSONLayer>(null)
  const areas = useMemo(() => splitOffshore(data), [data])
  const colorOf = useCallback((id: string) => cssColor(regions.find((r) => r.id === id)?.color), [regions])
  const nameOf = useCallback((id: string) => regions.find((r) => r.id === id)?.name ?? id, [regions])
  const select = useLatest(onSelectRegion)
  const selectedRef = useLatest(selectedRegionId)

  // React Leaflet gọi lại setStyle khi prop style đổi → style là hàm ổn định, chỉ đổi khi vùng chọn đổi
  const styleFor = useCallback(
    (id: string, offshore = false): PathOptions =>
      regionStyle(colorOf(id), id === selectedRegionId, selectedRegionId !== null && id !== selectedRegionId, offshore),
    [colorOf, selectedRegionId],
  )
  const styleRef = useLatest(styleFor)
  const style = useCallback(
    (f?: GeoJSON.Feature<GeoJSON.Geometry, WithOffshore<RegionFeatureProps>>) =>
      f ? styleFor(f.properties.regionId, f.properties.offshore) : {},
    [styleFor],
  )

  // Theo hình mẫu: giữ toàn quốc, vùng đang chọn có nhãn bong bóng phía trên.
  // Riêng màn xếp dọc (điện thoại, máy tính bảng) thì phóng vào vùng, vì ở cỡ toàn quốc các tỉnh quá nhỏ để chạm
  useEffect(() => {
    const zoomIn = regionPadding(deviceOf(window.innerWidth), map.getContainer().clientHeight, legendBox(map))
    if (!selectedRegionId) {
      if (zoomIn) fitCountry(map)
      return
    }
    // Khung phóng tính cả quần đảo xa bờ: Hoàng Sa, Trường Sa luôn hiện cùng vùng của mình
    const bounds = zoomIn && regionBounds(data, selectedRegionId)
    if (zoomIn && bounds) map.fitBounds(bounds, zoomIn)
    let tooltip: L.Tooltip | null = null
    layerRef.current?.eachLayer((l) => {
      const props = (l as PathWithFeature<WithOffshore<RegionFeatureProps>>).feature?.properties
      // Nhãn đặt trên phần đất liền, không tính quần đảo xa bờ
      if (l instanceof L.Polygon && props?.regionId === selectedRegionId && !props.offshore) {
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
  }, [selectedRegionId, map, nameOf, data])

  const onEachFeature = (feature: GeoJSON.Feature<GeoJSON.Geometry, WithOffshore<RegionFeatureProps>>, layer: Layer) => {
    const { regionId: id, offshore } = feature.properties
    bindHoverName(layer, nameOf(id), () => selectedRef.current === id)
    layer.on({
      click: () => select.current(id),
      mouseover: (e) => !offshore && (e.target as L.Path).setStyle({ weight: 3 }),
      mouseout: (e) => (e.target as L.Path).setStyle(styleRef.current(id, offshore)),
    })
  }

  return <GeoJSON ref={layerRef} data={areas} style={style} onEachFeature={onEachFeature} />
}

function ProvincesLayer({
  data,
  regionId,
  selectedProvinceId,
  onSelectProvince,
}: { data: AreaCollection<ProvinceFeatureProps>; regionId: string } & Pick<VietnamMapProps, 'selectedProvinceId' | 'onSelectProvince'>) {
  const select = useLatest(onSelectProvince)
  const selectedRef = useLatest(selectedProvinceId)
  const filtered = useMemo(
    () => splitOffshore({ ...data, features: data.features.filter((f) => f.properties.regionId === regionId) }),
    [data, regionId],
  )
  const style = useCallback(
    (f?: GeoJSON.Feature<GeoJSON.Geometry, WithOffshore<ProvinceFeatureProps>>): PathOptions => {
      const selected = f?.properties.provinceId === selectedProvinceId
      if (f?.properties.offshore) return { stroke: false, fillColor: '#f59e0b', fillOpacity: selected ? 0.55 : 0 }
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

  // Ghim tên tỉnh đặt giữa phần đất liền (Khánh Hòa, Đà Nẵng không bị kéo ra quần đảo)
  const selected = filtered.features.find((f) => f.properties.provinceId === selectedProvinceId && !f.properties.offshore)
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
          bindHoverName(layer, feature.properties.name, () => selectedRef.current === feature.properties.provinceId)
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
    // Dời sang trái khi có khung nổi ở mép phải bản đồ (máy tính bảng: --map-right-inset)
    <div style={{ right: 'calc(var(--map-right-inset, 0px) + 0.75rem)' }} className="absolute top-3 z-[1000] flex flex-col gap-2">
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
