// Mảnh dùng chung của trình xem ảnh lớn (mọi thiết bị). Không chứa lớp responsive.
import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import type { WebImage } from '../../../types/content'
import { ImageCredit } from '../ImageCredit'
import { ImageSkeleton } from '../ImageSkeleton'
import { markIfComplete } from '../imageLoad'

/** Ảnh lớn vừa khít khung: khung chờ khi đang tải, thông báo khi tải hỏng. Đặt trong khung relative có nền tối */
export function ImageStage({ image }: { image: WebImage }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  return (
    <>
      {failed ? (
        <div className="flex flex-col items-center gap-2 text-surface">
          <ImageOff aria-hidden className="size-10" />
          <span>Hình ảnh hiện không tải được</span>
        </div>
      ) : (
        !loaded && (
          <span className="absolute inset-3 m-auto aspect-[4/3] max-h-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)]">
            <ImageSkeleton className="rounded-lg bg-surface/15" />
          </span>
        )
      )}
      {!failed && (
        <img
          ref={markIfComplete(setLoaded)}
          src={image.src.url}
          srcSet={image.src.srcset.map((s) => `${s.url} ${s.width}w`).join(', ')}
          sizes="100vw"
          alt={image.alt}
          width={image.src.width}
          height={image.src.height}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`max-h-full max-w-full rounded-lg object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </>
  )
}

/** Chú thích và ghi nguồn của ảnh */
export function ImageCaption({ image, className = '' }: { image: WebImage; className?: string }) {
  return (
    <div className={`flex flex-col gap-0.5 rounded-xl bg-surface px-4 py-2.5 leading-snug ${className}`}>
      <span className="text-sm">{image.caption}</span>
      <ImageCredit image={image} />
    </div>
  )
}

export interface ImageViewerProps {
  image: WebImage
  onClose(): void
}
