import { BookOpen, Clapperboard, FileText, Images, MapPinned, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { EmptyState, LoadingState } from '../../components/ui/states'
import { repository } from '../../features/content'
import { imageLibrary } from '../../features/images'
import { loadProduce } from '../../features/produce'
import { collectSources, type SourceRow } from '../../features/sources'
import { loadFestivalVideos } from '../../features/videos'
import { SGK_URL, sgkPageUrl } from '../../lib/sources'
import { GRID_FILL } from '../../components/ui/grid'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const
const link = 'text-primary underline decoration-dotted underline-offset-2 hover:text-primary-dark'

interface SourcesData {
  rows: SourceRow[]
  itemCount: number
  imageCount: number
  videoCount: number
}

async function loadSources(): Promise<SourcesData> {
  const regions = repository.getRegions()
  const contents = await Promise.all(regions.map((r) => repository.loadRegionContent(r.id).catch(() => null)))
  const withItems = regions.flatMap((r, i) => {
    const content = contents[i]
    return content ? [{ regionId: r.id, regionName: r.name, items: content.items }] : []
  })
  // ảnh địa danh + ảnh cây trồng, video lễ hội: phần thêm, lỗi tải thì tính là 0
  const [images, cropImages, videos] = await Promise.all([
    imageLibrary.loadAll().catch(() => []),
    loadProduce().then(
      (p) => p.crops.length,
      () => 0,
    ),
    loadFestivalVideos().then(
      (v) => v.all.length,
      () => 0,
    ),
  ])
  return {
    rows: collectSources(withItems),
    itemCount: withItems.reduce((n, r) => n + r.items.length, 0),
    imageCount: images.length + cropImages,
    videoCount: videos,
  }
}

/** Link mở nguồn: bài SGK mở đúng trang đầu tiên được dẫn */
function sourceHref(row: SourceRow) {
  return row.url === SGK_URL && row.pages[0] !== undefined ? sgkPageUrl(row.pages[0]) : row.url
}

/** Thống kê mọi nguồn tham khảo của nội dung đang hiện trên trang */
export default function SourcesPage() {
  const [data, setData] = useState<SourcesData | null>(null)
  useEffect(() => {
    let cancelled = false
    loadSources().then((d) => !cancelled && setData(d))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-bold">Nguồn tham khảo</h1>
        <p className="mt-1 max-w-3xl text-muted">
          Nội dung trên trang được soạn lại bằng lời của các em từ sách giáo khoa Lịch sử và Địa lý 4 (Kết nối tri thức với cuộc sống). Bấm
          vào tên bài hoặc số trang để mở đúng trang sách, bấm vào tên mục để đọc nội dung.
        </p>
      </div>
      {data === null ? (
        <LoadingState label="Đang tổng hợp nguồn tham khảo…" />
      ) : data.rows.length === 0 ? (
        <EmptyState title="Chưa có nguồn tham khảo" description="Nội dung đang được giáo viên duyệt." />
      ) : (
        <>
          <ul aria-label="Tổng quan nguồn tham khảo" className={`${GRID_FILL.xs} gap-3`}>
            <Stat icon={BookOpen} label="Bài học SGK được dẫn" value={data.rows.filter((r) => r.url === SGK_URL).length} />
            <Stat icon={FileText} label="Trang sách được dẫn" value={new Set(data.rows.flatMap((r) => r.pages)).size} />
            <Stat icon={MapPinned} label="Mục nội dung" value={data.itemCount} />
            <Stat icon={Images} label="Ảnh nhúng" value={data.imageCount}>
              <Link to="/nguon-anh" className={`${link} text-sm font-semibold`}>
                Xem nguồn ảnh
              </Link>
            </Stat>
            <Stat icon={Clapperboard} label="Video lễ hội" value={data.videoCount}>
              <Link to="/nguon-anh" className={`${link} text-sm font-semibold`}>
                Xem nguồn video
              </Link>
            </Stat>
          </ul>
          <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
            <table aria-label="Thống kê nguồn tham khảo" className="w-full text-left text-sm">
              <thead className="bg-bg text-muted">
                <tr>
                  {['Nguồn', 'Vùng', 'Trang sách', 'Số mục', 'Mục nội dung dùng nguồn này'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => {
                  const href = sourceHref(row)
                  return (
                    <tr key={row.title} className="border-t border-line align-top">
                      <th scope="row" className="min-w-56 px-4 py-3 font-semibold">
                        {href ? (
                          <a href={href} {...external} className={link}>
                            {row.title}
                          </a>
                        ) : (
                          row.title
                        )}
                      </th>
                      <td className="px-4 py-3">{row.regionNames.join(', ')}</td>
                      <td className="px-4 py-3">
                        <span className="flex flex-wrap gap-x-2 gap-y-1">
                          {row.pages.map((p) =>
                            row.url === SGK_URL ? (
                              <a key={p} href={sgkPageUrl(p)} {...external} className={`${link} whitespace-nowrap`}>
                                tr. {p}
                              </a>
                            ) : (
                              <span key={p} className="whitespace-nowrap">
                                tr. {p}
                              </span>
                            ),
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{row.items.length}</td>
                      <td className="min-w-64 px-4 py-3">
                        <ul className="flex flex-wrap gap-x-3 gap-y-1">
                          {row.items.map((i) => (
                            <li key={i.id}>
                              <Link to={`/dia-danh/${i.id}`} className={link}>
                                {i.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

/** Ô số liệu cùng kiểu với trang Tiến độ: icon trong ô tròn, số lớn, nhãn ngắn bên dưới (nhãn xuống dòng không làm lệch số) */
function Stat({ icon: Icon, label, value, children }: { icon: LucideIcon; label: string; value: number; children?: ReactNode }) {
  return (
    <li className="flex flex-col gap-2 rounded-card bg-surface p-5 shadow-sm">
      <span className="mb-1 grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft">
        <Icon aria-hidden className="size-6 text-primary" />
      </span>
      <span className="text-3xl font-extrabold leading-9">{value}</span>
      <p className="text-sm font-semibold leading-snug text-muted">{label}</p>
      {children}
    </li>
  )
}
