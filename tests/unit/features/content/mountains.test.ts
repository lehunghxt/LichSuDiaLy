import { globSync, readFileSync } from 'node:fs'
import { SGK_URL } from '../../../../src/lib/sources'

// Mục "Núi tiêu biểu" của mỗi vùng (docs/research/nui/README.md)
const read = (f: string) => JSON.parse(readFileSync(f, 'utf8')) as unknown
interface Item {
  id: string
  title: string
  status: string
  location?: { lat: number; lng: number }
  sources: { title: string; url: string }[]
}
const REGIONS = ['trung-du-mien-nui-phia-bac', 'dong-bang-bac-bo', 'bac-trung-bo-va-nam-trung-bo', 'nam-bo']
const items = new Map(globSync('src/data/regions/*/sections/*.json').flatMap((f) => (read(f) as Item[]).map((i) => [i.id, i] as const)))
const imageItemIds = new Set(globSync('src/data/images/*/*.json').flatMap((f) => (read(f) as { itemIds: string[] }[]).flatMap((i) => i.itemIds)))
const topicOf = (regionId: string) =>
  (read(`src/data/regions/${regionId}/outline.json`) as { sections: { id: string; topics: { id: string; title: string; itemIds: string[] }[] }[] }).sections
    .find((s) => s.id === 'thien-nhien')!
    .topics.find((t) => t.id === 'nui-tieu-bieu')

test.each(REGIONS)('%s has a "Núi tiêu biểu" topic in Thiên nhiên', (regionId) => {
  const topic = topicOf(regionId)
  expect(topic?.title).toBe('Núi tiêu biểu')
  expect(topic!.itemIds.length).toBeGreaterThanOrEqual(2)
})

test('every mountain has a sourced position on the map and a photo, except where no free photo exists', () => {
  // Commons chưa có ảnh tự do đúng chủ thể (docs/research/nui/README.md)
  const noPhoto = new Set(['trung-du-mien-nui-phia-bac__nui-tay-con-linh', 'bac-trung-bo-va-nam-trung-bo__khoi-nui-ngoc-linh'])
  // Wikidata chưa có tọa độ
  const noPosition = new Set(['bac-trung-bo-va-nam-trung-bo__nui-ngu-binh'])
  for (const regionId of REGIONS) {
    for (const id of topicOf(regionId)!.itemIds) {
      const item = items.get(id)!
      if (!noPosition.has(id)) {
        expect(item.location, id).toBeDefined()
        expect(item.sources.some((s) => s.url.startsWith('https://www.wikidata.org/')), `${id}: nguồn tọa độ`).toBe(true)
      }
      if (!noPhoto.has(id)) expect(imageItemIds.has(id), `${id}: ảnh`).toBe(true)
    }
  }
})

test('mountains outside the SGK cite Wikipedia', () => {
  for (const regionId of REGIONS) {
    for (const id of topicOf(regionId)!.itemIds) {
      const item = items.get(id)!
      if (item.sources.some((s) => s.url === SGK_URL)) continue
      expect(item.sources.some((s) => s.url.startsWith('https://vi.wikipedia.org/')), id).toBe(true)
    }
  }
})
