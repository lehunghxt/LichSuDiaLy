import { Map as MapIcon } from 'lucide-react'
import { ExploreSections, FunFacts, Hero, Journey, ProgressCard, RegionCards, SectionTitle } from './sections'
import type { HomeView } from './view'

/** Điện thoại: mọi khối xếp một cột; bản đồ thu nhỏ dưới lời chào */
export function MobileHome({ view }: { view: HomeView }) {
  const { content, regionCount, active, outline } = view
  return (
    <div className="flex flex-col gap-10 pb-6">
      <Hero
        content={content}
        regionCount={regionCount}
        layout="stacked"
        className="px-5 py-8"
        titleClassName="text-3xl"
        mapClassName="h-[380px]"
      />
      <Journey layout="column" />
      <section aria-labelledby="regions-title">
        <SectionTitle id="regions-title" icon={MapIcon} title="Bốn vùng đất của Tổ quốc" subtitle="Theo SGK Lịch sử và Địa lí 4" />
        <RegionCards columns={1} />
      </section>
      <FunFacts content={content} />
      <ProgressCard content={content} regionCount={regionCount} />
      {active && outline && <ExploreSections region={active} outline={outline} content={content} columns={2} />}
    </div>
  )
}
