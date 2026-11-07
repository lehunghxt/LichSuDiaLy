import { ImageIcon } from 'lucide-react'
import { WebImageFigure } from '../../../components/ui/WebImageFigure'
import { type WebImage } from '../../../types/content'
import { interleaveByProvince } from '../../images/library'

/** Ảnh của vùng chưa có nội dung bài học: xem trước cảnh quan, văn hoá theo từng chủ đề */
export function RegionGallery({ images }: { images: WebImage[] }) {
  if (images.length === 0) return null
  return (
    <section aria-label="Hình ảnh của vùng" className="border-t border-line pt-5">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <ImageIcon aria-hidden className="size-6 text-primary" />
        Hình ảnh của vùng
      </h3>
      <ul className="grid grid-cols-2 gap-4">
        {interleaveByProvince(images)
          .slice(0, 8)
          .map((img) => (
            <li key={img.id}>
              <WebImageFigure image={img} showCaption sizes="(min-width: 1024px) 18vw, 50vw" />
            </li>
          ))}
      </ul>
    </section>
  )
}
