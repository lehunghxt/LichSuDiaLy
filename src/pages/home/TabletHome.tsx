import { Map as MapIcon } from 'lucide-react'
import { ExploreSections, FunFacts, Hero, Journey, ProgressCard, RegionCards, SectionTitle } from './sections'
import type { HomeView } from './view'

/** Máy tính bảng: lời chào và bản đồ xếp dọc; các bước một hàng; thẻ vùng 2 cột */
export function TabletHome({ view }: { view: HomeView }) {
  const { content, regionCount, active, outline } = view
  return (
    <div className="flex flex-col gap-10 pb-6">
      <Hero
        content={content}
        regionCount={regionCount}
        layout="stacked"
        className="px-10 py-12"
        titleClassName="text-4xl"
        mapClassName="h-[460px]"
      />
      <Journey layout="row" />
      <section aria-labelledby="regions-title">
        <SectionTitle id="regions-title" icon={MapIcon} title="Bốn vùng đất của Tổ quốc" subtitle="Theo SGK Lịch sử và Địa lí 4" />
        <RegionCards columns={2} />
      </section>
      <FunFacts content={content} />
      <ProgressCard content={content} regionCount={regionCount} />
      {active && outline && <ExploreSections region={active} outline={outline} content={content} columns={4} />}
    </div>
  )
}
