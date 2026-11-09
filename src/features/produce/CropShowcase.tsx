import { ChevronLeft, ChevronRight, Factory, Sprout } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { WebImageFigure } from '../../components/ui/WebImageFigure'
import { CROP_KIND_LABELS, CROP_KINDS, type CropEntry, type CropGroups, type CropKind } from './produce'

interface CropShowcaseProps {
  groups: CropGroups
  /** sgk: cây của vùng, ghi trang SGK; ngoai-sgk: cây của tỉnh, nhãn "Ngoài SGK" và nguồn từng cây */
  source: 'sgk' | 'ngoai-sgk'
}

const KIND_ICON: Record<CropKind, typeof Factory> = { 'cong-nghiep': Factory, 'nong-nghiep': Sprout }

/** "Cây trồng tiêu biểu": hai nhóm cây công nghiệp / cây nông nghiệp, mỗi cây một ảnh (bấm để xem lớn) có ghi nguồn.
 *  Mỗi nhóm là một dải vuốt ngang; nhóm không có cây thì ẩn, không có cây nào thì không hiện gì */
export function CropShowcase({ groups, source }: CropShowcaseProps) {
  const kinds = CROP_KINDS.filter((k) => groups[k].length > 0)
  if (kinds.length === 0) return null
  return (
    <section aria-label="Cây trồng tiêu biểu" className="flex flex-col gap-3">
      <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">
        Cây trồng tiêu biểu
        {source === 'ngoai-sgk' && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Ngoài SGK</span>
        )}
      </h3>
      {kinds.map((kind) => {
        const Icon = KIND_ICON[kind]
        return (
          <div key={kind} className="flex flex-col gap-2">
            <p className="flex items-center gap-1.5 text-sm font-bold text-muted">
              <Icon aria-hidden className="size-4" />
              {CROP_KIND_LABELS[kind]}
            </p>
            <ScrollRow label={CROP_KIND_LABELS[kind]}>
              {groups[kind].map((entry) => (
                <CropTile key={entry.crop.id} entry={entry} />
              ))}
            </ScrollRow>
          </div>
        )
      })}
    </section>
  )
}

/** Dải vuốt ngang; còn cây bị khuất thì mép đó mờ dần và có nút mũi tên để cuộn (em biết còn cây phía sau) */
function ScrollRow({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null)
  const [more, setMore] = useState({ left: false, right: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () =>
      setMore({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      observer?.disconnect()
    }
  }, [])
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  const fade = `linear-gradient(to right, ${more.left ? 'transparent, black 2.5rem' : 'black'}, ${more.right ? 'black calc(100% - 2.5rem), transparent' : 'black'})`
  const arrow =
    'absolute top-14 z-10 grid size-9 place-items-center rounded-full bg-surface text-ink shadow-md ring-1 ring-line hover:bg-primary-soft'
  return (
    <div className="relative">
      <ul
        ref={ref}
        aria-label={label}
        style={{ maskImage: fade, WebkitMaskImage: fade }}
        className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1"
      >
        {children}
      </ul>
      {more.left && (
        <button type="button" aria-label={`Xem các cây trước (${label})`} onClick={() => scroll(-1)} className={`${arrow} -left-2`}>
          <ChevronLeft aria-hidden className="size-5" />
        </button>
      )}
      {more.right && (
        <button type="button" aria-label={`Xem thêm cây (${label})`} onClick={() => scroll(1)} className={`${arrow} -right-2`}>
          <ChevronRight aria-hidden className="size-5" />
        </button>
      )}
    </div>
  )
}

function CropTile({ entry }: { entry: CropEntry }) {
  const { crop, page, source } = entry
  return (
    <li className="flex w-36 shrink-0 snap-start flex-col gap-1">
      <h4 className="font-bold leading-tight">{crop.name}</h4>
      <WebImageFigure image={crop.image} sizes="160px" aspect="4 / 3" credit="compact" />
      <p className="text-xs text-muted">
        {page !== undefined && `SGK tr. ${page}`}
        {source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Nguồn: ${source.title}`}
            title={source.title}
            className="underline decoration-dotted underline-offset-2 hover:text-primary"
          >
            Nguồn: Wikipedia
          </a>
        )}
      </p>
    </li>
  )
}
