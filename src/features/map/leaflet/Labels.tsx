import L from 'leaflet'
import { Marker } from 'react-leaflet'
import type { LabelCollection } from '../geo'

/** Tên quần đảo, biển (không bấm được) */
export function Labels({ data }: { data: LabelCollection }) {
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
