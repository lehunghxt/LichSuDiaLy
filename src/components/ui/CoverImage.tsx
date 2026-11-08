import { useState } from 'react'
import type { WebImage } from '../../types/content'
import { markIfComplete } from './imageLoad'

/** Ảnh Commons phủ kín khung cha (khung cần relative + overflow-hidden), hiện dần khi tải xong.
 *  Chỉ minh hoạ (alt rỗng): tên của thẻ/link chứa nó đã nói nội dung; ghi nguồn đặt ngoài thẻ */
export function CoverImage({ image, sizes }: { image: WebImage; sizes: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      ref={markIfComplete(setLoaded)}
      src={image.src.url}
      srcSet={image.src.srcset.map((x) => `${x.url} ${x.width}w`).join(', ')}
      sizes={sizes}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
