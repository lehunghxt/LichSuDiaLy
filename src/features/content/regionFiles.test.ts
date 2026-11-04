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

test('assembleRegionRaw merges region.json, section files and quizzes; injects section and regionId', () => {
  const raw = assembleRegionRaw(region, {
    'region.json': { intro: 'Giới thiệu.' },
    'sections/thien-nhien.json': [item('a'), item('b')],
    'sections/dan-cu-san-xuat.json': [item('c')],
    'quizzes.json': [],
  })
  const content = parseRegionContent(raw)
  expect(content.intro).toBe('Giới thiệu.')
  expect(content.items.map((i) => [i.id, i.section, i.regionId])).toEqual([
    ['vung-a__a', 'thien-nhien', 'vung-a'],
    ['vung-a__b', 'thien-nhien', 'vung-a'],
    ['vung-a__c', 'dan-cu-san-xuat', 'vung-a'],
  ])
})

test('items follow SECTIONS order regardless of file order', () => {
  const raw = assembleRegionRaw(region, {
    'sections/lich-su.json': [item('z')],
    'region.json': { intro: 'x' },
    'sections/thien-nhien.json': [item('a')],
  })
  expect(parseRegionContent(raw).items.map((i) => i.section)).toEqual(['thien-nhien', 'lich-su'])
})

test('missing section files and quizzes.json are allowed (empty)', () => {
  const content = parseRegionContent(assembleRegionRaw(region, { 'region.json': { intro: 'x' } }))
  expect(content.items).toEqual([])
  expect(content.quizzes).toEqual([])
})

test('item declaring a section different from its file is rejected', () => {
  expect(() =>
    assembleRegionRaw(region, { 'region.json': { intro: 'x' }, 'sections/thien-nhien.json': [{ ...item('a'), section: 'dan-cu-san-xuat' }] }),
  ).toThrow(ContentError)
})

test('unknown file name is rejected with its path', () => {
  expect(() => assembleRegionRaw(region, { 'region.json': { intro: 'x' }, 'sections/nui.json': [] })).toThrow(/sections\/nui\.json/)
})

test('loadersFromGlob groups files by region folder and only for declared regions', async () => {
  const modules = {
    '../../data/regions/vung-a/region.json': async () => ({ default: { intro: 'Giới thiệu.' } }),
    '../../data/regions/vung-a/sections/thien-nhien.json': async () => ({ default: [item('a')] }),
    '../../data/regions/vung-b/region.json': async () => ({ default: { intro: 'y' } }),
  }
  const loaders = loadersFromGlob([region], modules)
  expect(Object.keys(loaders)).toEqual(['vung-a'])
  const content = parseRegionContent(await loaders['vung-a']?.())
  expect(content.items).toHaveLength(1)
  expect(content.region.id).toBe('vung-a')
})

test('loadersFromGlob gives no content loader to a region that only has outline.json', () => {
  const modules = { '../../data/regions/vung-a/outline.json': async () => ({ default: { sections: [] } }) }
  expect(loadersFromGlob([region], modules)).toEqual({})
})
