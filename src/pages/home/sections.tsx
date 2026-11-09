// Các khối của Trang chủ, dùng chung cho mọi thiết bị. Không chứa lớp responsive (sm:/md:/lg:):
// cách xếp khác nhau chọn qua prop; file Home.mobile/tablet/desktop.tsx quyết định.
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Flag,
  Gamepad2,
  Lightbulb,
  Map as MapIcon,
  MountainSnow,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { CoverImage } from '../../components/ui/CoverImage'
import { ImageCredit } from '../../components/ui/ImageCredit'
import { repository, SECTION_ICONS, SECTION_TILE } from '../../features/content'
import { useRegionCovers } from '../../features/images'
import { MiniVietnamMap } from '../../features/map'
import { useProgress } from '../../features/progress'
import { SECTION_LABELS, type RegionMeta } from '../../types/content'
import type { HomeSummary } from '../../types/homeSummary'

const card = 'rounded-card bg-surface shadow-[0_8px_30px_rgb(15_23_42/0.08)]'

// Số cột cố định của lưới, chọn theo bố cục (chuỗi nguyên văn để Tailwind quét được)
const COLUMNS = { 1: 'grid-cols-1', 2: 'grid-cols-2', 4: 'grid-cols-4' } as const

export function SectionTitle({ id, icon: Icon, title, subtitle }: { id: string; icon: LucideIcon; title: string; subtitle?: string }) {
  return (
    // Cỡ chữ theo bề rộng khung chứa (container query): khung hẹp thì chữ nhỏ hơn để tiêu đề nằm gọn một dòng;
    // vẫn phải xuống dòng thì chia đều hai dòng (text-balance), không để một chữ rớt lẻ
    <div className="@container mb-5">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <h2 id={id} className="flex items-center gap-3 text-xl font-bold leading-tight @md:text-2xl">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <Icon aria-hidden className="size-6 text-primary" />
          </span>
          <span className="text-balance">{title}</span>
        </h2>
        {subtitle && <p className="pb-0.5 text-muted">{subtitle}</p>}
      </div>
    </div>
  )
}

/**
 * Huy hiệu bên bản đồ thu nhỏ; nội dung lấy từ SGK (tr. 19, 20, 33). Cả ba đều ở miền Bắc nên trên bố cục split
 * xếp dọc ở góc trên, ngay bên phải phần miền Bắc của bản đồ (không đặt cạnh biển đảo để em khỏi hiểu sai vị trí)
 */
const BADGES: { icon: LucideIcon; text: string; sub: string; className: string; delay: string }[] = [
  { icon: Flag, text: 'Cột cờ Lũng Cú', sub: 'Nơi địa đầu Tổ quốc', className: 'right-0 top-0', delay: '0s' },
  { icon: MountainSnow, text: 'Phan-xi-păng', sub: '3 147 m, cao nhất Việt Nam', className: 'right-0 top-[17%]', delay: '1.2s' },
  { icon: Star, text: 'Giỗ Tổ Hùng Vương', sub: '10 tháng Ba âm lịch', className: 'right-0 top-[34%]', delay: '2.4s' },
]

function Badge({ icon: Icon, text, sub }: { icon: LucideIcon; text: string; sub: string }) {
  return (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
        <Icon aria-hidden className="size-6 text-primary" />
      </span>
      <span className="text-sm leading-tight">
        <span className="block font-bold">{text}</span>
        <span className="text-muted">{sub}</span>
      </span>
    </>
  )
}

interface HeroProps {
  summary: HomeSummary
  regionCount: number
  /** split: chữ bên trái, bản đồ bên phải; stacked: bản đồ dưới chữ */
  layout: 'split' | 'stacked'
  /** Lề trong của banner, cỡ chữ tiêu đề, chiều cao bản đồ: do bố cục từng thiết bị đặt */
  className: string
  titleClassName: string
  mapClassName: string
}

export function Hero({ summary, regionCount, layout, className, titleClassName, mapClassName }: HeroProps) {
  // Số liệu tính trên cả bốn vùng, cùng phạm vi với "4 vùng đất"
  const stats = [
    { value: regionCount, label: 'vùng đất' },
    { value: summary.regions.reduce((n, r) => n + r.items.length, 0), label: 'mục khám phá' },
    { value: summary.regions.reduce((n, r) => n + r.questions, 0), label: 'câu hỏi trắc nghiệm' },
  ]
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-emerald-100 shadow-[0_8px_30px_rgb(15_23_42/0.08)] ${className}`}
    >
      <Decor />
      <div
        className={`relative grid items-center gap-10 ${layout === 'split' ? 'grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)]'}`}
      >
        <div className="flex flex-col gap-6">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
            <Sparkles aria-hidden className="size-4 text-accent" />
            Lịch sử và Địa lý lớp 4 · Theo SGK Kết nối tri thức với cuộc sống
          </p>
          <h1 className={`font-extrabold leading-tight text-[#1e293b] ${titleClassName}`}>
            Em khám phá{' '}
            <span className="block bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Lịch sử và Địa lý Việt Nam
            </span>
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Cùng du hành qua các vùng đất của Tổ quốc: ngắm bản đồ, tìm hiểu thiên nhiên, lễ hội, di tích và thử tài với những câu đố vui.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/ban-do"
              className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-primary px-8 text-lg font-bold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              <MapIcon aria-hidden className="size-6" />
              Bắt đầu khám phá
              <ArrowRight aria-hidden className="size-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/on-tap"
              className="inline-flex min-h-14 items-center gap-3 rounded-full border-2 border-primary/20 bg-white px-8 text-lg font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary"
            >
              <Gamepad2 aria-hidden className="size-6" />
              Chơi trắc nghiệm
            </Link>
          </div>
          <ul className={`grid gap-3 ${layout === 'split' ? 'w-fit grid-cols-[repeat(3,auto)]' : 'grid-cols-3'}`}>
            {stats.map((s) => (
              <li key={s.label} className={`rounded-2xl bg-white/80 py-3 shadow-sm ${layout === 'split' ? 'px-4' : 'px-3'}`}>
                <span className="block text-2xl font-extrabold text-primary">{s.value}</span>
                <span className={`block font-semibold leading-tight text-muted ${layout === 'split' ? 'text-sm' : 'text-xs'}`}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className={`relative mx-auto w-full max-w-xl ${mapClassName}`}>
            <div aria-hidden className="absolute inset-8 rounded-full bg-sky-200/50 blur-2xl" />
            <MiniVietnamMap regions={repository.getRegions()} className="relative mx-auto h-full drop-shadow-xl" />
            {layout === 'split' &&
              BADGES.map(({ className, delay, ...badge }) => (
                <div
                  key={badge.text}
                  className={`animate-float absolute flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg ${className}`}
                  style={{ animationDelay: delay }}
                >
                  <Badge {...badge} />
                </div>
              ))}
          </div>
          {/* Khung hẹp: huy hiệu xếp thành lưới dưới bản đồ, không đè lên bản đồ và lên nhau */}
          {layout === 'stacked' && (
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
              {BADGES.map(({ icon, text, sub }) => (
                <li key={text} className="flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-sm">
                  <Badge icon={icon} text={text} sub={sub} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

/** Mây và núi trang trí nền banner */
function Decor() {
  return (
    <svg aria-hidden viewBox="0 0 1200 400" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
      <g fill="#fff" opacity="0.9">
        <ellipse cx="160" cy="60" rx="70" ry="22" />
        <ellipse cx="210" cy="48" rx="50" ry="26" />
        <ellipse cx="980" cy="70" rx="80" ry="22" />
        <ellipse cx="1040" cy="56" rx="46" ry="24" />
      </g>
      <path d="M0 400 L180 300 L300 350 L460 270 L620 360 L760 300 L920 350 L1080 280 L1200 330 L1200 400 Z" fill="#bbf7d0" opacity="0.7" />
      <path d="M0 400 L240 350 L420 380 L640 330 L860 385 L1200 350 L1200 400 Z" fill="#86efac" opacity="0.6" />
    </svg>
  )
}

const STEPS: { icon: LucideIcon; title: string; text: string; tone: string }[] = [
  {
    icon: MapIcon,
    title: 'Chọn vùng trên bản đồ',
    text: 'Bấm vào một vùng để xem vị trí, các tỉnh và những địa điểm tiêu biểu.',
    tone: 'bg-sky-100 text-sky-600',
  },
  {
    icon: Search,
    title: 'Khám phá theo dàn ý',
    text: 'Thiên nhiên, dân cư và sản xuất, văn hóa, lịch sử của từng vùng, có hình trong SGK.',
    tone: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: BookOpenCheck,
    title: 'Trắc nghiệm vui',
    text: 'Trả lời câu hỏi, ghép đôi và xem lại câu sai để nhớ bài lâu hơn.',
    tone: 'bg-amber-100 text-amber-600',
  },
]

/** column: các bước xếp dọc; row: ba bước một hàng, có mũi tên nối */
export function Journey({ layout }: { layout: 'column' | 'row' }) {
  return (
    <section aria-labelledby="journey-title">
      <SectionTitle id="journey-title" icon={Sparkles} title="Hành trình khám phá của em" />
      <ol aria-label="Hành trình khám phá của em" className={`grid gap-5 ${layout === 'row' ? 'grid-cols-3' : ''}`}>
        {STEPS.map(({ icon: Icon, title, text, tone }, i) => (
          <li key={title} className={`${card} relative flex gap-4 p-6`}>
            <span className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
              <Icon aria-hidden className="size-7" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-muted">Bước {i + 1}</p>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-1 text-muted">{text}</p>
            </div>
            {layout === 'row' && i < STEPS.length - 1 && (
              <ArrowRight
                aria-hidden
                className="absolute -right-5 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full bg-white p-1.5 text-primary shadow"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function RegionCards({ columns }: { columns: 1 | 2 | 4 }) {
  const { state } = useProgress()
  const regions = repository.getRegions()
  const covers = useRegionCovers(regions.map((r) => r.id))
  return (
    <ul aria-label="Bốn vùng đất của Tổ quốc" className={`grid gap-5 ${COLUMNS[columns]}`}>
      {regions.map((r) => {
        const visited = state.visitedRegionIds.includes(r.id)
        const cover = covers[r.id]
        const body = (
          <>
            {/* Ảnh tiêu biểu của vùng; dải màu của vùng làm nền khi ảnh đang tải hoặc không có ảnh */}
            <span
              className="relative block h-40 overflow-hidden rounded-t-card"
              style={{ background: `linear-gradient(135deg, var(--color-${r.color}), #ffffff)` }}
            >
              {cover && <CoverImage image={cover} sizes={`${Math.ceil(100 / columns)}vw`} />}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: `var(--color-${r.color})` }} />
            </span>
            <span className="flex flex-1 flex-col gap-2 p-5">
              <span className="text-lg font-bold leading-snug">{r.name}</span>
              {r.status === 'active' ? (
                <span className="mt-auto inline-flex items-center gap-1 font-semibold text-primary">
                  {visited ? <CheckCircle2 aria-hidden className="size-5 text-secondary" /> : null}
                  {visited ? 'Em đã ghé thăm' : 'Khám phá ngay'}
                  <ArrowRight aria-hidden className="size-4" />
                </span>
              ) : (
                <span className="mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-line px-3 py-1 text-sm font-semibold text-muted">
                  <Clock aria-hidden className="size-4" />
                  Sắp ra mắt
                </span>
              )}
            </span>
          </>
        )
        return (
          <li key={r.id} className={`${card} flex flex-col transition hover:-translate-y-1 hover:shadow-lg`}>
            {r.status === 'active' ? (
              <Link to={`/ban-do/${r.id}`} className="flex flex-1 flex-col rounded-card">
                {body}
              </Link>
            ) : (
              <div className="flex flex-1 flex-col opacity-80">{body}</div>
            )}
            {/* Ghi nguồn ảnh Commons (TASL), nằm ngoài link của thẻ vì có link riêng; luôn cao đủ hai dòng để nút của các thẻ cùng hàng thẳng nhau */}
            {cover && (
              <p className="-mt-2 line-clamp-2 min-h-[calc(2lh+1rem)] px-5 pb-4 text-xs leading-tight">
                <ImageCredit image={cover} />
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Xen kẽ các vùng (vùng 1, vùng 2, … rồi quay lại) để mỗi lần bấm "Điều thú vị khác" là một vùng khác */
function interleave<T>(lists: T[][]): T[] {
  const longest = Math.max(0, ...lists.map((l) => l.length))
  return Array.from({ length: longest }, (_, i) => lists.flatMap((l) => (i < l.length ? [l[i]!] : []))).flat()
}

export function FunFacts({ summary, regions }: { summary: HomeSummary; regions: RegionMeta[] }) {
  const [index, setIndex] = useState(0)
  const facts = interleave(
    summary.regions.map((r) => {
      const region = regions.find((m) => m.id === r.id)
      return r.funFacts.flatMap(({ fact, itemId }) => {
        const item = r.items.find((i) => i.id === itemId)
        return region && item ? [{ fact, item, region }] : []
      })
    }),
  )
  const current = facts.length > 0 ? facts[index % facts.length] : undefined

  return (
    <section
      aria-labelledby="fun-title"
      className="relative overflow-hidden rounded-card bg-gradient-to-br from-amber-100 to-orange-50 p-6 shadow-[0_8px_30px_rgb(15_23_42/0.08)]"
    >
      <Lightbulb aria-hidden className="absolute -right-8 -top-8 size-32 rotate-12 text-amber-200/70" />
      <h2 id="fun-title" className="relative flex items-center gap-3 text-2xl font-bold">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white">
          <Lightbulb aria-hidden className="size-6 text-amber-500" />
        </span>
        Em có biết?
      </h2>
      {current ? (
        <div className="relative mt-5 flex flex-col gap-3">
          {/* Ghi rõ vùng: câu trong SGK hay viết "vùng" mà không nêu tên */}
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-amber-800">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: `var(--color-${current.region.color})` }} />
            {current.region.name}
          </p>
          <p key={index} data-testid="fun-fact" className="animate-fade-up min-h-24 pr-10 text-2xl font-semibold leading-relaxed">
            {current.fact}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-500 px-5 font-bold text-white shadow-md transition hover:bg-amber-600"
            >
              <RefreshCw aria-hidden className="size-5" />
              Điều thú vị khác
            </button>
            <Link
              to={`/dia-danh/${current.item.id}`}
              className="inline-flex min-h-12 items-center gap-1 rounded-full bg-white px-5 font-semibold text-amber-700 shadow-sm hover:bg-amber-50"
            >
              Xem thêm: {current.item.title}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <span className="text-sm text-amber-800/70">
              {(index % facts.length) + 1}/{facts.length}
            </span>
          </div>
        </div>
      ) : (
        <p className="relative mt-5 text-muted">Đang tìm điều thú vị cho em…</p>
      )}
    </section>
  )
}

export function ProgressCard({ summary, regionCount }: { summary: HomeSummary; regionCount: number }) {
  const { state } = useProgress()
  const all = summary.regions.flatMap((r) => r.items)
  const recent = state.recentItemIds.map((id) => all.find((i) => i.id === id)).find((i) => i !== undefined)
  const itemTotal = all.length
  const viewed = state.viewedItemIds.filter((id) => all.some((i) => i.id === id)).length
  const percent = itemTotal ? Math.round((viewed / itemTotal) * 100) : 0

  return (
    <section aria-labelledby="progress-title" className={`${card} flex flex-col gap-5 p-6`}>
      <h2 id="progress-title" className="flex items-center gap-3 text-2xl font-bold">
        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100">
          <Star aria-hidden className="size-6 text-emerald-600" />
        </span>
        Tiến độ của em
      </h2>
      <div>
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>Mục đã xem</span>
          <span>
            {viewed}/{itemTotal || '…'}
          </span>
        </div>
        <div
          className="h-4 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-label="Mục đã xem"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-3">
        <li className="rounded-2xl bg-bg p-4">
          <span className="block text-2xl font-extrabold text-primary">
            {state.visitedRegionIds.length}/{regionCount}
          </span>
          <span className="text-sm text-muted">vùng đã ghé</span>
        </li>
        <li className="rounded-2xl bg-bg p-4">
          <span className="block text-2xl font-extrabold text-primary">{Object.keys(state.quizzes).length}</span>
          <span className="text-sm text-muted">bài trắc nghiệm đã làm</span>
        </li>
      </ul>
      {recent ? (
        <Link
          to={`/dia-danh/${recent.id}`}
          className="inline-flex min-h-12 items-center justify-between gap-2 rounded-2xl bg-primary-soft px-5 font-bold text-primary hover:bg-primary hover:text-white"
        >
          <span>Tiếp tục: {recent.title}</span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      ) : (
        <p className="rounded-2xl bg-bg p-4 text-muted">Em chưa xem mục nào. Hãy bắt đầu từ bản đồ nhé!</p>
      )}
    </section>
  )
}

/** Các phần của dàn ý một vùng, mỗi phần một ô dẫn vào bản đồ; em chọn vùng bằng hàng nút phía trên */
export function ExploreSections(props: { regions: RegionMeta[]; summary: HomeSummary; columns: 2 | 4 }) {
  const { regions, summary, columns } = props
  const choices = regions.filter((r) => r.status === 'active')
  const [regionId, setRegionId] = useState(choices[0]?.id)
  const region = choices.find((r) => r.id === regionId)
  const sections = summary.regions.find((r) => r.id === regionId)?.sections ?? []
  if (!region) return null
  return (
    <section aria-labelledby="topics-title">
      <SectionTitle id="topics-title" icon={Search} title="Các phần khám phá" subtitle={region.name} />
      <div role="group" aria-label="Chọn vùng" className="-mt-1 mb-5 flex flex-wrap gap-2">
        {choices.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={r.id === regionId}
            onClick={() => setRegionId(r.id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-semibold transition ${
              r.id === regionId ? 'border-primary bg-primary text-white' : 'border-line bg-surface hover:border-primary/40'
            }`}
          >
            <span aria-hidden className="size-3 rounded-full ring-2 ring-white" style={{ background: `var(--color-${r.color})` }} />
            {r.shortName}
          </button>
        ))}
      </div>
      {sections.length > 0 && (
        <ul aria-label="Các phần khám phá" className={`grid gap-4 ${COLUMNS[columns]}`}>
          {sections.map((section) => {
            const c = section.id
            const Icon = SECTION_ICONS[c]
            const style = SECTION_TILE[c]
            return (
              <li key={c}>
                <Link
                  to={`/ban-do/${region.id}?phan=${c}`}
                  className={`group flex h-full flex-col items-center gap-3 rounded-card border-2 p-6 text-center font-bold shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${style.tile}`}
                >
                  <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-110">
                    <Icon aria-hidden className={`size-9 ${style.icon}`} strokeWidth={1.75} />
                  </span>
                  <span data-label>{SECTION_LABELS[c]}</span>
                  <span className="text-sm font-semibold text-muted">
                    {section.filled}/{section.topics} mục có nội dung
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
