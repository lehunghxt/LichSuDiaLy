import { Map as MapIcon } from 'lucide-react'
import { ExploreSections, FunFacts, Hero, Journey, ProgressCard, RegionCards, SectionTitle } from './sections'
import type { HomeView } from './view'

/** Máy tính bảng: lời chào và bản đồ xếp dọc; các bước một hàng; thẻ vùng 2 cột */
export function TabletHome({ view }: { view: HomeView }) {
  const { regions, summary } = view
  return (
    <div className="flex flex-col gap-10 pb-6">
      <Hero
        summary={summary}
        regionCount={regions.length}
        layout="stacked"
        className="px-10 py-12"
        titleClassName="text-4xl"
        mapClassName="h-[460px]"
      />
      <Journey layout="row" />
      <section aria-labelledby="regions-title">
        <SectionTitle id="regions-title" icon={MapIcon} title="Bốn vùng đất của Tổ quốc" subtitle="Theo SGK Lịch sử và Địa lý 4" />
        <RegionCards columns={2} />
      </section>
      <FunFacts summary={summary} regions={regions} />
      <ProgressCard summary={summary} regionCount={regions.length} />
      <ExploreSections regions={regions} summary={summary} columns={4} />
    </div>
  )
}
