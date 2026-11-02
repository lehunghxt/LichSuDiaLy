import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { rawRegionContent, SGK_URL, type RawRegionContent } from '../../test/fixtures'
import { checkIntegrity } from './integrity'
import { parseRegionContent, parseRegionList } from './parse'

function fixture() {
  const raw = rawRegionContent()
  return { raw, regions: [raw.region] }
}

function check(raw: RawRegionContent, manifestIds: string[] = []) {
  return checkIntegrity([parseRegionContent(raw)], [parseRegionContent(raw).region], new Set(manifestIds), SGK_URL)
}

test('valid fixture has no problems', () => {
  expect(check(fixture().raw)).toEqual([])
})

test('all ids unique', () => {
  const { raw } = fixture()
  raw.items[1] = { ...raw.items[1]!, id: raw.items[0]!.id }
  expect(check(raw)).toContainEqual(expect.stringContaining('trùng id "vung-a__dia-danh-1"'))
})

test('ids must use "<regionId>__<slug>" prefix', () => {
  const { raw } = fixture()
  raw.items[1] = { ...raw.items[1]!, id: 'khoang-san-1', relatedIds: [] }
  raw.items[0] = { ...raw.items[0]!, relatedIds: [] }
  expect(check(raw)).toContainEqual(expect.stringContaining('"khoang-san-1" phải bắt đầu bằng "vung-a__"'))
})

test('relatedIds and map_locate ids resolve', () => {
  const { raw } = fixture()
  raw.items[0] = { ...raw.items[0]!, relatedIds: ['vung-a__khong-co'] }
  raw.quizzes[0]!.questions.push({
    id: 'q3', type: 'map_locate', prompt: '?', explanation: '.', status: 'draft', sources: [],
    targetItemId: 'vung-a__x', candidateItemIds: ['vung-a__x', 'vung-a__dia-danh-1'],
  } as never)
  const problems = check(raw)
  expect(problems).toContainEqual(expect.stringContaining('relatedIds: không có "vung-a__khong-co"'))
  expect(problems).toContainEqual(expect.stringContaining('không có địa danh "vung-a__x"'))
})

test('map_locate candidates must have location', () => {
  const { raw } = fixture()
  raw.quizzes[0]!.questions.push({
    id: 'q3', type: 'map_locate', prompt: '?', explanation: '.', status: 'draft', sources: [],
    targetItemId: 'vung-a__khoang-san-1', candidateItemIds: ['vung-a__khoang-san-1', 'vung-a__dia-danh-1'],
  } as never)
  expect(check(raw)).toContainEqual(expect.stringContaining('"vung-a__khoang-san-1" chưa có tọa độ'))
})

test('verified items and questions have ≥1 source whose url is the SGK link', () => {
  const { raw } = fixture()
  raw.items[0] = { ...raw.items[0]!, sources: [{ title: 'Báo', url: 'https://example.com', note: 'tr. 2' }] }
  raw.quizzes[0]!.questions[0] = { ...raw.quizzes[0]!.questions[0]!, sources: [] }
  const problems = check(raw)
  expect(problems).toContainEqual(expect.stringContaining('vung-a__dia-danh-1: đã duyệt nhưng chưa trích nguồn SGK'))
  expect(problems).toContainEqual(expect.stringContaining('q1: đã duyệt nhưng chưa trích nguồn SGK'))
})

test('every imageId exists in image-manifest.json', () => {
  const { raw } = fixture()
  raw.items[0] = {
    ...raw.items[0]!,
    images: [{ imageId: 'anh-thieu', alt: 'a', credit: 'c', license: 'l' }] as never,
  }
  expect(check(raw)).toContainEqual(expect.stringContaining('ảnh "anh-thieu" chưa có trong image-manifest.json'))
  expect(check(raw, ['anh-thieu'])).toEqual([])
})

test('location lat/lng inside Vietnam bbox', () => {
  const { raw } = fixture()
  raw.items[0] = { ...raw.items[0]!, location: { lat: 35, lng: 103.8, placeName: 'X' } }
  expect(check(raw)).toContainEqual(expect.stringContaining('tọa độ nằm ngoài lãnh thổ Việt Nam'))
})

test('item regionId must match its region file', () => {
  const { raw } = fixture()
  raw.items[0] = { ...raw.items[0]!, regionId: 'vung-b' }
  expect(check(raw)).toContainEqual(expect.stringContaining('regionId "vung-b" khác vùng "vung-a"'))
})

test('real data in src/data passes integrity check', () => {
  const dataDir = path.resolve(import.meta.dirname, '../../data')
  const regions = parseRegionList(JSON.parse(readFileSync(path.join(dataDir, 'regions.json'), 'utf8')))
  const manifest: unknown = JSON.parse(readFileSync(path.join(dataDir, 'image-manifest.json'), 'utf8'))
  const manifestIds = new Set(typeof manifest === 'object' && manifest ? Object.keys(manifest) : [])
  const files = readdirSync(path.join(dataDir, 'regions')).filter((f) => f.endsWith('.json'))
  const contents = files.map((f) => {
    const content = parseRegionContent(JSON.parse(readFileSync(path.join(dataDir, 'regions', f), 'utf8')))
    expect(`${content.region.id}.json`).toBe(f)
    return content
  })
  expect(checkIntegrity(contents, regions, manifestIds, SGK_URL)).toEqual([])
})
