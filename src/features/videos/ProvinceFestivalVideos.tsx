import { Clapperboard } from 'lucide-react'
import { useFestivalVideos } from './useFestivalVideos'
import { YouTubeVideo } from './YouTubeVideo'

/** "Lễ hội qua video": video lễ hội của tỉnh từ YouTube (ngoài SGK), mỗi video ghi tên và kênh đăng.
 *  Tỉnh chưa có video thì không hiện gì */
export function ProvinceFestivalVideos({ provinceId }: { provinceId: string }) {
  const videos = useFestivalVideos()?.forProvince(provinceId) ?? []
  if (videos.length === 0) return null
  return (
    <section aria-label="Lễ hội qua video" className="flex flex-col gap-3">
      <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">
        <Clapperboard aria-hidden className="size-5 text-primary" />
        Lễ hội qua video
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Ngoài SGK</span>
      </h3>
      <ul className="flex flex-col gap-4">
        {videos.map((v) => (
          <li key={v.video.id} className="flex flex-col gap-1.5">
            <h4 className="font-bold leading-tight">{v.festival}</h4>
            <YouTubeVideo video={v.video} />
          </li>
        ))}
      </ul>
    </section>
  )
}
