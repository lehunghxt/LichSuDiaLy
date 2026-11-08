import { useEffect, useState } from 'react'
import { parseFestivalVideos, type FestivalVideos } from './festivalVideos'

let loading: Promise<FestivalVideos> | null = null

/** Tải danh sách video một lần, khi lần đầu cần (không nằm trong chunk ban đầu); lỗi thì lần sau tải lại */
export function loadFestivalVideos(): Promise<FestivalVideos> {
  loading ??= import('../../data/festival-videos.json')
    .then((m) => parseFestivalVideos(m.default))
    .catch((e: unknown) => {
      loading = null
      throw e
    })
  return loading
}

/** null khi đang tải hoặc tải lỗi: video chỉ là phần thêm, lỗi thì ẩn đi */
export function useFestivalVideos(): FestivalVideos | null {
  const [videos, setVideos] = useState<FestivalVideos | null>(null)
  useEffect(() => {
    let cancelled = false
    loadFestivalVideos().then(
      (v) => !cancelled && setVideos(v),
      () => {},
    )
    return () => {
      cancelled = true
    }
  }, [])
  return videos
}
