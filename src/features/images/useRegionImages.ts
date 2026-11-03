import { useEffect, useState } from 'react'
import type { WebImage } from '../../types/content'
import { imageLibrary, type ImageLibrary } from './library'

/** Ảnh nhúng của một vùng; ảnh chỉ là phần bổ sung nên lỗi tải coi như không có ảnh */
export function useRegionImages(regionId: string | undefined, lib: Pick<ImageLibrary, 'loadRegion'> = imageLibrary): WebImage[] {
  const [loaded, setLoaded] = useState<{ regionId: string; images: WebImage[] } | null>(null)
  useEffect(() => {
    if (!regionId) return
    let cancelled = false
    lib.loadRegion(regionId).then(
      (images) => !cancelled && setLoaded({ regionId, images }),
      () => !cancelled && setLoaded({ regionId, images: [] }),
    )
    return () => {
      cancelled = true
    }
  }, [regionId, lib])
  return loaded && loaded.regionId === regionId ? loaded.images : []
}
