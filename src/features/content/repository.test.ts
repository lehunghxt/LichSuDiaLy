import { rawRegionContent } from '../../test/fixtures'
import { createRepository, getItemsBySection, isPublished } from './repository'

const regionList = [rawRegionContent().region]

function repo(loader: () => Promise<unknown> = async () => ({ default: rawRegionContent() })) {
  return createRepository(regionList, { 'vung-a': loader })
}

afterEach(() => {
  vi.unstubAllEnvs()
})

test('getRegions returns parsed region list', () => {
  expect(
    repo()
      .getRegions()
      .map((r) => r.id),
  ).toEqual(['vung-a'])
})

test('loadRegionContent returns null for unknown id', async () => {
  expect(await repo().loadRegionContent('khong-co')).toBeNull()
})

test('loadRegionContent caches the loaded region', async () => {
  const loader = vi.fn(async () => ({ default: rawRegionContent() }))
  const r = repo(loader)
  await r.loadRegionContent('vung-a')
  await r.loadRegionContent('vung-a')
  expect(loader).toHaveBeenCalledTimes(1)
})

test('isPublished hides draft in PROD', () => {
  vi.stubEnv('PROD', true)
  expect(isPublished('draft')).toBe(false)
  expect(isPublished('verified')).toBe(true)
})

test('isPublished shows draft in development', () => {
  vi.stubEnv('PROD', false)
  expect(isPublished('draft')).toBe(true)
})

test('draft items and questions are filtered out in PROD', async () => {
  vi.stubEnv('PROD', true)
  const content = await repo().loadRegionContent('vung-a')
  expect(content?.items.map((i) => i.id)).toEqual(['vung-a__dia-danh-1'])
  expect(content?.quizzes[0]?.questions.map((q) => q.id)).toEqual(['q1'])
  // relatedIds trỏ tới mục draft cũng bị loại
  expect(content?.items[0]?.relatedIds).toEqual([])
})

test('getItemsBySection returns [] for empty section', async () => {
  const content = await repo().loadRegionContent('vung-a')
  expect(content).not.toBeNull()
  if (content) expect(getItemsBySection(content, 'lich-su')).toEqual([])
})

test('findItem resolves region from id prefix', async () => {
  const found = await repo().findItem('vung-a__dia-danh-1')
  expect(found?.item.title).toBe('Địa danh 1')
  expect(found?.content.region.id).toBe('vung-a')
})

test('findItem returns null for malformed id', async () => {
  expect(await repo().findItem('khong-dung-dinh-dang')).toBeNull()
  expect(await repo().findItem('vung-a__khong-co')).toBeNull()
})

test('findQuiz returns quiz or null', async () => {
  expect((await repo().findQuiz('vung-a__on-tap-1'))?.quiz.title).toBe('Ôn tập 1')
  expect(await repo().findQuiz('vung-b__on-tap-1')).toBeNull()
})

test('loader failure rejects with error (caller shows ErrorState)', async () => {
  const r = repo(async () => {
    throw new Error('network')
  })
  await expect(r.loadRegionContent('vung-a')).rejects.toThrow('network')
})

test('loadOutline parses the region outline; region without one gives null', async () => {
  const outline = { sections: [{ id: 'thien-nhien', topics: [{ id: 'dia-hinh', title: 'Địa hình', itemIds: ['vung-a__dia-danh-1'] }] }] }
  const repo = createRepository([rawRegionContent().region], {}, { 'vung-a': () => Promise.resolve({ default: outline }) })
  const o = await repo.loadOutline('vung-a')
  expect(o?.sections[0]?.topics[0]?.title).toBe('Địa hình')
  expect(await repo.loadOutline('vung-b')).toBeNull()
})
