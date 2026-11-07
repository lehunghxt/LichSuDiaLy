import L, { type GeoJSON as GeoJSONLayer, type Layer, type PathOptions } from 'leaflet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import { useDevice } from '../../../lib/device'
import { useLatest } from '../../../lib/useLatest'
import type { RegionMeta } from '../../../types/content'
import { regionPadding } from '../fit'
import { regionBounds, splitOffshore, type AreaCollection, type RegionFeatureProps, type WithOffshore } from '../geo'
import { bindHoverName } from '../hoverName'
import { fitCountry, legendBox } from './view'

interface RegionsLayerProps {
  data: AreaCollection<RegionFeatureProps>
  regions: RegionMeta[]
  selectedRegionId: string | null
  onSelectRegion(id: string): void
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

export function RegionsLayer({ data, regions, selectedRegionId, onSelectRegion }: RegionsLayerProps) {
  const map = useMap()
  const device = useDevice()
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
    const zoomIn = regionPadding(device, map.getContainer().clientHeight, legendBox(map))
    if (!selectedRegionId) {
      if (zoomIn) fitCountry(map, device)
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
  }, [selectedRegionId, map, nameOf, data, device])

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
