import { useEffect, useState } from 'react'
import type { RegionOutline } from '../../types/content'
import { repository } from './repository'

type Repo = Pick<typeof repository, 'loadOutline'>

/** Dàn ý của vùng; null khi chưa tải xong, vùng không có dàn ý hoặc tải lỗi */
export function useRegionOutline(regionId: string | undefined, repo: Repo = repository): RegionOutline | null {
  const [state, setState] = useState<{ regionId: string; outline: RegionOutline | null } | null>(null)

  useEffect(() => {
    if (!regionId) return
    let cancelled = false
    repo.loadOutline(regionId).then(
      (outline) => !cancelled && setState({ regionId, outline }),
      () => !cancelled && setState({ regionId, outline: null }),
    )
    return () => {
      cancelled = true
    }
  }, [regionId, repo])

  return state && state.regionId === regionId ? state.outline : null
}
