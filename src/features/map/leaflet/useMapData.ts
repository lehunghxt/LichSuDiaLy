import { useEffect, useState } from 'react'
import { geoLoader, type AreaCollection, type LabelCollection, type ProvinceFeatureProps, type RegionFeatureProps } from '../geo'

/** Tải ranh giới vùng, tỉnh và nhãn biển đảo; retry() để tải lại khi lỗi */
export type Loaded = {
  regions: AreaCollection<RegionFeatureProps>
  provinces: AreaCollection<ProvinceFeatureProps>
  labels: LabelCollection
}

export function useMapData() {
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
