import { assembleRegionRaw, loadersFromGlob } from './regionFiles'
import { ContentError, parseRegionContent } from './parse'

const region = { id: 'vung-a', name: 'Vùng A', shortName: 'A', color: 'region-tdmnpb', status: 'active' }
const item = (slug: string) => ({
  id: `vung-a__${slug}`,
  title: slug,
  summary: 'Tóm tắt.',
  highlights: [],
  keyPoints: [],
  images: [],
  relatedIds: [],
  sources: [],
  status: 'draft',
})

test('assembleRegionRaw merges region.json, topic files and quizzes; injects category and regionId', () => {
  const raw = assembleRegionRaw(region, {
    'region.json': { intro: 'Giới thiệu.' },
    'topics/natural.json': [item('a'), item('b')],
    'topics/mineral.json': [item('c')],
    'quizzes.json': [],
  })
  const content = parseRegionContent(raw)
  expect(content.intro).toBe('Giới thiệu.')
  expect(content.items.map((i) => [i.id, i.category, i.regionId])).toEqual([
    ['vung-a__a', 'natural', 'vung-a'],
    ['vung-a__b', 'natural', 'vung-a'],
    ['vung-a__c', 'mineral', 'vung-a'],
  ])
})

test('items follow TOPIC_CATEGORIES order regardless of file order', () => {
  const raw = assembleRegionRaw(region, {
    'topics/historical_site.json': [item('z')],
    'region.json': { intro: 'x' },
    'topics/natural.json': [item('a')],
  })
  expect(parseRegionContent(raw).items.map((i) => i.category)).toEqual(['natural', 'historical_site'])
})

test('missing topic files and quizzes.json are allowed (empty)', () => {
  const content = parseRegionContent(assembleRegionRaw(region, { 'region.json': { intro: 'x' } }))
  expect(content.items).toEqual([])
  expect(content.quizzes).toEqual([])
})

test('item declaring a category different from its file is rejected', () => {
  expect(() =>
    assembleRegionRaw(region, { 'region.json': { intro: 'x' }, 'topics/natural.json': [{ ...item('a'), category: 'mineral' }] }),
  ).toThrow(ContentError)
})

test('unknown file name is rejected with its path', () => {
  expect(() => assembleRegionRaw(region, { 'region.json': { intro: 'x' }, 'topics/nui.json': [] })).toThrow(/topics\/nui\.json/)
})

test('loadersFromGlob groups files by region folder and only for declared regions', async () => {
  const modules = {
    '../../data/regions/vung-a/region.json': async () => ({ default: { intro: 'Giới thiệu.' } }),
    '../../data/regions/vung-a/topics/natural.json': async () => ({ default: [item('a')] }),
    '../../data/regions/vung-b/region.json': async () => ({ default: { intro: 'y' } }),
  }
  const loaders = loadersFromGlob([region], modules)
  expect(Object.keys(loaders)).toEqual(['vung-a'])
  const content = parseRegionContent(await loaders['vung-a']?.())
  expect(content.items).toHaveLength(1)
  expect(content.region.id).toBe('vung-a')
})
