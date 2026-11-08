import L, { type PathOptions } from 'leaflet'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { GeoJSON, Marker, useMap } from 'react-leaflet'
import { useDevice } from '../../../lib/device'
import { useLatest } from '../../../lib/useLatest'
import { provinceFit, regionPadding } from '../fit'
import { splitOffshore, type AreaCollection, type ProvinceFeatureProps, type WithOffshore } from '../geo'
import { bindHoverName } from '../hoverName'
import { fitCountry, legendBox } from './view'

interface ProvincesLayerProps {
  data: AreaCollection<ProvinceFeatureProps>
  regionId: string
  selectedProvinceId: string | null
  onSelectProvince(id: string | null): void
}

export function ProvincesLayer({ data, regionId, selectedProvinceId, onSelectProvince }: ProvincesLayerProps) {
  const map = useMap()
  const device = useDevice()
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

  // Chọn tỉnh: phóng vào phần đất liền của tỉnh (Khánh Hòa, Đà Nẵng không bị kéo ra quần đảo xa bờ).
  // Bỏ chọn tỉnh (vẫn trong vùng đó): về lại khung của vùng như lúc mới chọn vùng. Đổi vùng thì RegionsLayer lo
  const shown = useRef<{ regionId: string; provinceId: string | null }>({ regionId, provinceId: null })
  useEffect(() => {
    const before = shown.current
    shown.current = { regionId, provinceId: selectedProvinceId }
    const frameHeight = map.getContainer().clientHeight
    if (selectedProvinceId) {
      const land = filtered.features.filter((f) => f.properties.provinceId === selectedProvinceId && !f.properties.offshore)
      if (land.length > 0) map.fitBounds(L.geoJSON(land).getBounds(), provinceFit(device, frameHeight, legendBox(map)))
      return
    }
    if (before.regionId !== regionId || !before.provinceId) return
    const zoomIn = regionPadding(device, frameHeight, legendBox(map))
    if (zoomIn && filtered.features.length > 0) map.fitBounds(L.geoJSON(filtered).getBounds(), zoomIn)
    else fitCountry(map, device)
  }, [selectedProvinceId, regionId, filtered, map, device])

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
