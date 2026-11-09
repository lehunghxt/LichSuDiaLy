import { Map as MapIcon } from 'lucide-react'
import { ExploreSections, FunFacts, Hero, Journey, ProgressCard, RegionCards, SectionTitle } from './sections'
import type { HomeView } from './view'

/** Desktop: lời chào bên trái, bản đồ bên phải; 4 thẻ vùng một hàng; "Em có biết?" cạnh tiến độ */
export function DesktopHome({ view }: { view: HomeView }) {
  const { regions, summary } = view
  return (
    <div className="flex flex-col gap-10 pb-6">
      <Hero
        summary={summary}
        regionCount={regions.length}
        layout="split"
        className="px-10 py-12"
        titleClassName="text-4xl xl:text-5xl"
        mapClassName="h-[460px]"
      />
      <Journey layout="row" />
      <section aria-labelledby="regions-title">
        <SectionTitle id="regions-title" icon={MapIcon} title="Bốn vùng đất của Tổ quốc" subtitle="Theo SGK Lịch sử và Địa lý 4" />
        <RegionCards columns={4} />
      </section>
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
        <FunFacts summary={summary} regions={regions} />
        <ProgressCard summary={summary} regionCount={regions.length} />
      </div>
      <ExploreSections regions={regions} summary={summary} columns={4} />
    </div>
  )
}
