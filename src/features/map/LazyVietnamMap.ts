import { lazy } from 'react'

/** Bản đồ Leaflet, tải sau: Leaflet và CSS của nó chỉ tải khi trang bản đồ cần */
export const VietnamMap = lazy(() => import('./VietnamMap'))
