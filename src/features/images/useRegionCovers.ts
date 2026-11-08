import { useEffect, useState } from 'react'
import type { WebImage } from '../../types/content'
import { imageLibrary, type ImageLibrary } from './library'

/** Ảnh bìa của nhiều vùng (theo quy tắc library.regionCover), tải song song; vùng chưa tải xong hoặc lỗi thì chưa có ảnh */
export function useRegionCovers(
  regionIds: string[],
  lib: Pick<ImageLibrary, 'loadRegion' | 'regionCover'> = imageLibrary,
): Record<string, WebImage | undefined> {
  const [covers, setCovers] = useState<Record<string, WebImage | undefined>>({})
  const key = regionIds.join('|')
  useEffect(() => {
    let cancelled = false
    for (const id of key.split('|').filter(Boolean)) {
      // Ảnh chỉ là phần bổ sung: lỗi tải thì thẻ giữ dải màu của vùng
      lib.loadRegion(id).then(
        (images) => !cancelled && setCovers((prev) => ({ ...prev, [id]: lib.regionCover(images) })),
        () => {},
      )
    }
    return () => {
      cancelled = true
    }
  }, [key, lib])
  return covers
}
