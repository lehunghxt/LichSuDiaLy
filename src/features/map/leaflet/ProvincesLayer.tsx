import L, { type PathOptions } from 'leaflet'
import { useCallback, useMemo } from 'react'
import { GeoJSON, Marker } from 'react-leaflet'
import { useLatest } from '../../../lib/useLatest'
import { splitOffshore, type AreaCollection, type ProvinceFeatureProps, type WithOffshore } from '../geo'
import { bindHoverName } from '../hoverName'

interface ProvincesLayerProps {
  data: AreaCollection<ProvinceFeatureProps>
  regionId: string
  selectedProvinceId: string | null
  onSelectProvince(id: string | null): void
}

export function ProvincesLayer({ data, regionId, selectedProvinceId, onSelectProvince }: ProvincesLayerProps) {
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
