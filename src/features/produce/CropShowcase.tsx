import { Factory, Sprout } from 'lucide-react'
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
            <ul aria-label={CROP_KIND_LABELS[kind]} className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
              {groups[kind].map((entry) => (
                <CropTile key={entry.crop.id} entry={entry} />
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

function CropTile({ entry }: { entry: CropEntry }) {
  const { crop, page, source } = entry
  return (
    <li className="flex w-36 shrink-0 snap-start flex-col gap-1">
      <h4 className="order-2 font-bold leading-tight">{crop.name}</h4>
      <WebImageFigure image={crop.image} sizes="160px" aspect="4 / 3" className="order-1" />
      <p className="order-3 text-xs text-muted">
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
