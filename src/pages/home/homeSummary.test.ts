// Số liệu Trang chủ tính lúc build (scripts/lib/home-summary.mjs) phải khớp với nội dung repository nạp lúc chạy
import summary from 'virtual:home-summary'
import { repository } from '../../features/content'

test('the build-time summary matches the content the app loads, region by region', async () => {
  const loaded = await Promise.all(repository.getRegions().map((r) => repository.loadRegionContent(r.id)))
  const contents = loaded.filter((c) => c !== null)
  expect(summary.regions.map((r) => r.id)).toEqual(contents.map((c) => c.region.id))

  for (const content of contents) {
    const r = summary.regions.find((x) => x.id === content.region.id)!
    expect(r.items).toEqual(content.items.map((i) => ({ id: i.id, title: i.title })))
    expect(r.questions).toBe(content.quizzes.reduce((n, q) => n + q.questions.length, 0))
    expect(r.funFacts).toEqual(content.items.flatMap((i) => (i.funFacts ?? []).map((fact) => ({ fact, itemId: i.id }))))

    const outline = await repository.loadOutline(content.region.id)
    const ids = new Set(content.items.map((i) => i.id))
    expect(r.sections).toEqual(
      (outline?.sections ?? []).map((s) => ({
        id: s.id,
        topics: s.topics.length,
        filled: s.topics.filter((t) => t.itemIds.some((id) => ids.has(id))).length,
      })),
    )
  }
})
