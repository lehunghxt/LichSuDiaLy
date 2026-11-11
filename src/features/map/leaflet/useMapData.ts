import { useEffect, useState } from 'react'
import {
  geoLoader,
  type AreaCollection,
  type LabelCollection,
  type NeighborFeatureProps,
  type ProvinceFeatureProps,
  type RegionFeatureProps,
} from '../geo'

/** Tải ranh giới vùng, tỉnh, nhãn biển đảo và đất nước ngoài; retry() để tải lại khi lỗi */
export type Loaded = {
  regions: AreaCollection<RegionFeatureProps>
  provinces: AreaCollection<ProvinceFeatureProps>
  labels: LabelCollection
  /** Chỉ là nền trang trí: tải lỗi thì null, bản đồ vẫn dùng được */
  neighbors: AreaCollection<NeighborFeatureProps> | null
}

export function useMapData() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'ready'; data: Loaded }>({
    status: 'loading',
  })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    Promise.all([geoLoader.loadRegions(), geoLoader.loadProvinces(), geoLoader.loadLabels(), geoLoader.loadNeighbors()]).then(
      ([r, p, l, n]) => {
        if (cancelled) return
        setState(
          r.ok && p.ok && l.ok
            ? { status: 'ready', data: { regions: r.data, provinces: p.data, labels: l.data, neighbors: n.ok ? n.data : null } }
            : { status: 'error' },
        )
      },
    )
    return () => {
      cancelled = true
    }
  }, [attempt])
  return { state, retry: () => setAttempt((n) => n + 1) }
}
