// Video lễ hội của từng tỉnh (ngoài SGK, nháp): nhúng từ YouTube, ghi tên video và kênh đăng.
// Dữ liệu: src/data/festival-videos.json; mỗi video đã được kiểm tra còn tồn tại và cho phép nhúng (oEmbed).
import { isPublished } from '../../lib/publishing'
import { ContentError, STATUSES, list, obj, oneOf, optStr, str } from '../../lib/validate'
import type { ContentStatus } from '../../types/content'

export interface YouTubeVideoInfo {
  provider: 'youtube'
  id: string
  title: string
  channel: string
  channelUrl: string
}

export interface FestivalVideo {
  provinceId: string
  festival: string
  /** Mục nội dung trên web nói về lễ hội này (nếu có) */
  itemId?: string
  status: ContentStatus
  video: YouTubeVideoInfo
}

export interface FestivalVideos {
  all: FestivalVideo[]
  forProvince(provinceId: string): FestivalVideo[]
}

const YOUTUBE_ID = /^[\w-]{11}$/

function nonEmpty(o: Record<string, unknown>, key: string, path: string): string {
  const v = str(o, key, path)
  if (!v.trim()) throw new ContentError(`${path}.${key}`, 'không được để trống')
  return v
}

function parseVideo(v: unknown, path: string): YouTubeVideoInfo {
  const o = obj(v, path)
  const id = str(o, 'id', path)
  if (!YOUTUBE_ID.test(id)) throw new ContentError(`${path}.id`, `"${id}" không phải mã video YouTube`)
  const channelUrl = str(o, 'channelUrl', path)
  if (!channelUrl.startsWith('https://www.youtube.com/')) throw new ContentError(`${path}.channelUrl`, 'cần là link kênh trên YouTube')
  return {
    provider: oneOf(o, 'provider', path, ['youtube'] as const),
    id,
    title: nonEmpty(o, 'title', path),
    channel: nonEmpty(o, 'channel', path),
    channelUrl,
  }
}

export function parseFestivalVideos(raw: unknown): FestivalVideos {
  const all = list({ videos: raw }, 'videos', 'festival-videos.json', (v, p): FestivalVideo => {
    const o = obj(v, p)
    const itemId = optStr(o, 'itemId', p)
    return {
      provinceId: str(o, 'provinceId', p),
      festival: nonEmpty(o, 'festival', p),
      ...(itemId ? { itemId } : {}),
      status: oneOf(o, 'status', p, STATUSES),
      video: parseVideo(o.video, `${p}.video`),
    }
  })
  return { all, forProvince: (id) => all.filter((v) => v.provinceId === id && isPublished(v.status)) }
}
