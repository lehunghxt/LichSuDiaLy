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
import { repository } from '../features/content/repository'
import { SECTION_ICONS, SECTION_TILE } from '../features/content/sectionIcons'
import { useRegionContent } from '../features/content/useRegionContent'
import { useRegionOutline } from '../features/content/useRegionOutline'
import { MiniVietnamMap } from '../features/map/MiniVietnamMap'
import { useProgress } from '../features/progress/useProgress'
import { SECTION_LABELS, type ContentItem, type RegionContent } from '../types/content'

const card = 'rounded-card bg-surface shadow-[0_8px_30px_rgb(15_23_42/0.08)]'

export default function HomePage() {
  const regions = repository.getRegions()
  const active = regions.find((r) => r.status === 'active')
  const content = useRegionContent(active?.id)
  const outline = useRegionOutline(active?.id)
  const ready = content.status === 'ready' ? content.content : null

  return (
    <div className="flex flex-col gap-10 pb-6">
      <Hero content={ready} regionCount={regions.length} />
      <Journey />

      <section aria-labelledby="regions-title">
        <SectionTitle id="regions-title" icon={MapIcon} title="Bốn vùng đất của Tổ quốc" subtitle="Theo SGK Lịch sử và Địa lí 4" />
        <RegionCards />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <FunFacts content={ready} />
        <ProgressCard content={ready} regionCount={regions.length} />
      </div>

      {active && outline && (
        <section aria-labelledby="topics-title">
          <SectionTitle id="topics-title" icon={Search} title="Các phần khám phá" subtitle={active.name} />
          <ul aria-label="Các phần khám phá" className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {outline.sections.map((section) => {
              const c = section.id
              const Icon = SECTION_ICONS[c]
              const style = SECTION_TILE[c]
              const ids = new Set(ready?.items.map((i) => i.id))
              const filled = section.topics.filter((t) => t.itemIds.some((id) => ids.has(id))).length
              return (
                <li key={c}>
                  <Link
                    to={`/ban-do/${active.id}?phan=${c}`}
                    className={`group flex h-full flex-col items-center gap-3 rounded-card border-2 p-6 text-center font-bold shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${style.tile}`}
                  >
                    <span className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-110">
                      <Icon aria-hidden className={`size-9 ${style.icon}`} strokeWidth={1.75} />
                    </span>
                    <span data-label>{SECTION_LABELS[c]}</span>
                    {ready && (
                      <span className="text-sm font-semibold text-muted">
                        {filled}/{section.topics.length} mục có nội dung
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function SectionTitle({ id, icon: Icon, title, subtitle }: { id: string; icon: LucideIcon; title: string; subtitle?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end gap-x-3 gap-y-1">
      <h2 id={id} className="flex items-center gap-3 text-2xl font-bold">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft">
          <Icon aria-hidden className="size-6 text-primary" />
        </span>
        {title}
      </h2>
      {subtitle && <p className="pb-1 text-muted">{subtitle}</p>}
    </div>
  )
}

/** Huy hiệu nổi trên bản đồ thu nhỏ; nội dung lấy từ SGK (tr. 19, 20, 33) */
const BADGES: { icon: LucideIcon; text: string; sub: string; className: string; delay: string }[] = [
  { icon: MountainSnow, text: 'Phan-xi-păng', sub: '3 147 m, cao nhất Việt Nam', className: 'right-0 top-4', delay: '0s' },
  { icon: Flag, text: 'Cột cờ Lũng Cú', sub: 'Nơi địa đầu Tổ quốc', className: 'right-0 top-[48%]', delay: '1.2s' },
  { icon: Star, text: 'Giỗ Tổ Hùng Vương', sub: '10 tháng Ba âm lịch', className: '-left-2 top-[52%]', delay: '2.4s' },
]

function Hero({ content, regionCount }: { content: RegionContent | null; regionCount: number }) {
  const questions = content?.quizzes.reduce((n, q) => n + q.questions.length, 0) ?? 0
  const stats = [
    { value: regionCount, label: 'vùng đất' },
    ...(content ? [{ value: content.items.length, label: 'mục khám phá' }, { value: questions, label: 'câu hỏi ôn tập' }] : []),
  ]
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-emerald-100 px-10 py-12 shadow-[0_8px_30px_rgb(15_23_42/0.08)]">
      <Decor />
      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary shadow-sm">
            <Sparkles aria-hidden className="size-4 text-accent" />
            Lịch sử và Địa lí lớp 4 · Theo SGK Kết nối tri thức với cuộc sống
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-[#1e293b] xl:text-5xl">
            Em khám phá{' '}
            <span className="block bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Lịch sử và Địa lí Việt Nam
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
          <ul className="flex flex-wrap gap-3">
            {stats.map((s) => (
              <li key={s.label} className="rounded-2xl bg-white/80 px-5 py-3 shadow-sm">
                <span className="block text-2xl font-extrabold text-primary">{s.value}</span>
                <span className="text-sm font-semibold text-muted">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto h-[460px] w-full max-w-xl">
          <div aria-hidden className="absolute inset-8 rounded-full bg-sky-200/50 blur-2xl" />
          <MiniVietnamMap regions={repository.getRegions()} className="relative mx-auto h-full drop-shadow-xl" />
          {BADGES.map(({ icon: Icon, text, sub, className, delay }) => (
            <div
              key={text}
              className={`animate-float absolute flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg ${className}`}
              style={{ animationDelay: delay }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft">
                <Icon aria-hidden className="size-6 text-primary" />
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-bold">{text}</span>
                <span className="text-muted">{sub}</span>
              </span>
            </div>
          ))}
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
  { icon: MapIcon, title: 'Chọn vùng trên bản đồ', text: 'Bấm vào một vùng để xem vị trí, các tỉnh và những địa điểm tiêu biểu.', tone: 'bg-sky-100 text-sky-600' },
  { icon: Search, title: 'Khám phá theo dàn ý', text: 'Thiên nhiên, dân cư và sản xuất, văn hóa, lịch sử của từng vùng, có hình trong SGK.', tone: 'bg-emerald-100 text-emerald-600' },
  { icon: BookOpenCheck, title: 'Ôn tập vui', text: 'Trả lời câu hỏi, ghép đôi và xem lại câu sai để nhớ bài lâu hơn.', tone: 'bg-amber-100 text-amber-600' },
]

function Journey() {
  return (
    <section aria-labelledby="journey-title">
      <SectionTitle id="journey-title" icon={Sparkles} title="Hành trình khám phá của em" />
      <ol aria-label="Hành trình khám phá của em" className="grid gap-5 md:grid-cols-3">
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
            {i < STEPS.length - 1 && (
              <ArrowRight aria-hidden className="absolute -right-5 top-1/2 z-10 hidden size-8 -translate-y-1/2 rounded-full bg-white p-1.5 text-primary shadow md:block" />
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function RegionCards() {
  const { state } = useProgress()
  return (
    <ul aria-label="Bốn vùng đất của Tổ quốc" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {repository.getRegions().map((r) => {
        const visited = state.visitedRegionIds.includes(r.id)
        const body = (
          <>
            <span aria-hidden className="block h-24 rounded-t-card" style={{ background: `linear-gradient(135deg, var(--color-${r.color}), #ffffff)` }} />
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
          <li key={r.id}>
            {r.status === 'active' ? (
              <Link to={`/ban-do/${r.id}`} className={`${card} flex h-full flex-col transition hover:-translate-y-1 hover:shadow-lg`}>
                {body}
              </Link>
            ) : (
              <div className={`${card} flex h-full flex-col opacity-80`}>{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function FunFacts({ content }: { content: RegionContent | null }) {
  const [index, setIndex] = useState(0)
  const facts = (content?.items ?? []).flatMap((item) => (item.funFacts ?? []).map((fact) => ({ fact, item })))
  const current = facts.length > 0 ? facts[index % facts.length] : undefined

  return (
    <section aria-labelledby="fun-title" className="relative overflow-hidden rounded-card bg-gradient-to-br from-amber-100 to-orange-50 p-8 shadow-[0_8px_30px_rgb(15_23_42/0.08)]">
      <Lightbulb aria-hidden className="absolute -right-6 -top-6 size-40 rotate-12 text-amber-200" />
      <h2 id="fun-title" className="relative flex items-center gap-3 text-2xl font-bold">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white">
          <Lightbulb aria-hidden className="size-6 text-amber-500" />
        </span>
        Em có biết?
      </h2>
      {current ? (
        <div className="relative mt-5 flex flex-col gap-5">
          <p key={index} data-testid="fun-fact" className="animate-fade-up min-h-24 text-2xl font-semibold leading-relaxed">
            {current.fact}
          </p>
          <div className="flex flex-wrap items-center gap-3">
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

function ProgressCard({ content, regionCount }: { content: RegionContent | null; regionCount: number }) {
  const { state } = useProgress()
  const recent: ContentItem | undefined = state.recentItemIds
    .map((id) => content?.items.find((i) => i.id === id))
    .find((i) => i !== undefined)
  const itemTotal = content?.items.length ?? 0
  const viewed = content ? state.viewedItemIds.filter((id) => content.items.some((i) => i.id === id)).length : state.viewedItemIds.length
  const percent = itemTotal ? Math.round((viewed / itemTotal) * 100) : 0

  return (
    <section aria-labelledby="progress-title" className={`${card} flex flex-col gap-5 p-8`}>
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
        <div className="h-4 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Mục đã xem" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary transition-all" style={{ width: `${percent}%` }} />
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
          <span className="text-sm text-muted">bài ôn tập đã làm</span>
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
