// Marker các địa danh có toạ độ (nguồn toạ độ ghi trong sources của mục), kèm popup mở chi tiết mục
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { SECTION_LABELS } from '../../types/content'
import type { Place } from './places'

const pinIcon = L.divIcon({
  className: 'place-pin',
  html: '<span aria-hidden="true"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
})

interface LocationMarkersProps {
  places: Place[]
  onOpen(place: Place): void
}

export function LocationMarkers({ places, onOpen }: LocationMarkersProps) {
  return places.map((place) =>
    place.location ? (
      <Marker
        key={place.id}
        position={[place.location.lat, place.location.lng]}
        icon={pinIcon}
        zIndexOffset={2000}
        // Leaflet đã cho icon tabindex và role="button"; thêm tên để trình đọc màn hình đọc được
        eventHandlers={{ add: (e) => e.target.getElement()?.setAttribute('aria-label', `Địa điểm: ${place.title}`) }}
      >
        <Popup>
          <div role="dialog" aria-label={place.title} className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">{SECTION_LABELS[place.section]}</span>
            <strong className="text-base leading-snug">{place.title}</strong>
            <button
              type="button"
              onClick={() => onOpen(place)}
              className="mt-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-3 focus-visible:outline-offset-2"
            >
              Xem chi tiết
            </button>
          </div>
        </Popup>
      </Marker>
    ) : null,
  )
}
