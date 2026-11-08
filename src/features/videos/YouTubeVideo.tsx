import { Play } from 'lucide-react'
import { useState } from 'react'
import type { YouTubeVideoInfo } from './festivalVideos'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const
const link = 'underline decoration-dotted underline-offset-2 hover:text-primary'

/** Video YouTube kiểu "nhẹ": hiện ảnh thu nhỏ, chỉ tải trình phát (youtube-nocookie) khi em bấm phát,
 *  nên trang không chậm đi và YouTube không đặt cookie trước khi em xem. Luôn ghi tên video và kênh đăng */
export function YouTubeVideo({ video }: { video: YouTubeVideoInfo }) {
  const [playing, setPlaying] = useState(false)
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`
  return (
    <figure className="flex flex-col gap-1.5">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={`Video: ${video.title}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Phát video: ${video.title}`}
            className="group absolute inset-0 size-full cursor-pointer"
          >
            <img
              src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="size-full object-cover opacity-90 transition group-hover:opacity-100"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-red-600 text-white shadow-lg transition group-hover:scale-110">
                <Play aria-hidden className="size-7 fill-current" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <p className="text-xs text-muted">
          Video:{' '}
          <a href={watchUrl} {...external} className={link}>
            {video.title}
          </a>
          , kênh{' '}
          <a href={video.channelUrl} {...external} className={link}>
            {video.channel}
          </a>
          , trên YouTube
        </p>
      </figcaption>
    </figure>
  )
}
