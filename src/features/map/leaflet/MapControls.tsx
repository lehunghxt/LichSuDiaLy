import L from 'leaflet'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { useDevice } from '../../../lib/device'
import { fitCountry } from './view'

/** Canh toàn quốc khi mở bản đồ (và khi đổi thiết bị), kèm thước tỉ lệ */
export function FitCountry() {
  const map = useMap()
  const device = useDevice()
  useEffect(() => {
    fitCountry(map, device)
    const scale = L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 160 }).addTo(map)
    return () => {
      scale.remove()
    }
  }, [map, device])
  return null
}

export function Controls() {
  const map = useMap()
  const device = useDevice()
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
      <button type="button" aria-label="Xem toàn bộ bản đồ" className={`${btn} mt-2`} onClick={() => fitCountry(map, device)}>
        <LocateFixed aria-hidden className="size-5" />
      </button>
    </div>
  )
}
