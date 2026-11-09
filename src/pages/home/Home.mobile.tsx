import { Map as MapIcon } from 'lucide-react'
import { ExploreSections, FunFacts, Hero, Journey, ProgressCard, RegionCards, SectionTitle } from './sections'
import type { HomeView } from './view'

/** Điện thoại: mọi khối xếp một cột; bản đồ thu nhỏ dưới lời chào */
export function MobileHome({ view }: { view: HomeView }) {
  const { regions, summary } = view
  return (
    <div className="flex flex-col gap-10 pb-6">
      <Hero
        summary={summary}
        regionCount={regions.length}
        layout="stacked"
        className="px-5 py-8"
        titleClassName="text-3xl"
        mapClassName="h-[300px]"
      />
      <Journey layout="column" />
      <section aria-labelledby="regions-title">
        <SectionTitle id="regions-title" icon={MapIcon} title="Bốn vùng đất của Tổ quốc" subtitle="Theo SGK Lịch sử và Địa lý 4" />
        <RegionCards columns={1} />
      </section>
      <FunFacts summary={summary} regions={regions} />
      <ProgressCard summary={summary} regionCount={regions.length} />
      <ExploreSections regions={regions} summary={summary} columns={2} />
    </div>
  )
}
