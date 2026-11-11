import L from 'leaflet'
import { Marker } from 'react-leaflet'
import type { LabelCollection } from '../geo'

const CLASS = { archipelago: 'map-label', sea: 'map-label map-label-sea', country: 'map-label map-label-country' }

/**
 * Tên quần đảo, biển, nước láng giềng (không bấm được).
 * Tên nước chỉ hiện ở khung toàn quốc: phóng vào vùng thì tên nước đè lên nhãn bong bóng tên vùng.
 */
export function Labels({ data, showCountries }: { data: LabelCollection; showCountries: boolean }) {
  return data.features.map((f) => {
    if (f.properties.kind === 'country' && !showCountries) return null
    const [lng, lat] = f.geometry.coordinates
    if (lng === undefined || lat === undefined) return null
    return (
      <Marker
        key={f.properties.name}
        position={[lat, lng]}
        interactive={false}
        keyboard={false}
        icon={L.divIcon({ className: CLASS[f.properties.kind], html: `<span>${f.properties.name.replace(' (', '<br>(')}</span>`, iconSize: [0, 0] })}
      />
    )
  })
}
