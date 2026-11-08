import { useEffect, useState } from 'react'
import { LoadingState } from '../components/ui/states'
import { imageLibrary } from '../features/images'
import { provinceName } from '../lib/provinces'
import type { WebImage } from '../types/content'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const
const link = 'text-primary underline decoration-dotted underline-offset-2 hover:text-primary-dark'

/** Danh sách mọi ảnh nhúng đang dùng, ghi đủ tác giả, giấy phép và trang gốc */
export default function ImageCreditsPage() {
  const [images, setImages] = useState<WebImage[] | null>(null)
  useEffect(() => {
    let cancelled = false
    imageLibrary.loadAll().then(
      (all) => !cancelled && setImages(all),
      () => !cancelled && setImages([]),
    )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold">Nguồn ảnh</h1>
        <p className="mt-1 max-w-3xl text-muted">
          Ảnh trên trang được nhúng trực tiếp từ Wikimedia Commons, với giấy phép tự do (Public domain, CC0, CC BY, CC BY-SA). Cảm ơn các
          tác giả đã chia sẻ; em bấm vào tên ảnh để xem trang gốc.
        </p>
      </div>
      {images === null ? (
        <LoadingState label="Đang tải danh sách ảnh…" />
      ) : images.length === 0 ? (
        <p className="text-muted">Chưa có ảnh nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg text-muted">
              <tr>
                {['Ảnh', 'Tỉnh', 'Tác giả', 'Giấy phép', 'Trang gốc'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {images.map((img) => {
                const a = img.attribution
                return (
                  <tr key={img.id} className="border-t border-line align-top">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <img
                          src={img.src.srcset[0]?.url ?? img.src.url}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="size-14 shrink-0 rounded-lg object-cover"
                        />
                        {img.caption}
                      </span>
                    </td>
                    <td className="px-4 py-3">{img.provinceId ? provinceName(img.provinceId) : 'Toàn vùng'}</td>
                    <td className="px-4 py-3">
                      {a.authorUrl ? (
                        <a href={a.authorUrl} {...external} className={link}>
                          {a.author}
                        </a>
                      ) : (
                        a.author
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.licenseUrl ? (
                        <a href={a.licenseUrl} {...external} className={link}>
                          {a.license}
                        </a>
                      ) : (
                        a.license
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a href={a.sourceUrl} {...external} className={`${link} break-all`}>
                        {a.title}
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
