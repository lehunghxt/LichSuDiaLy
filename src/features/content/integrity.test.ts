import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { rawRegionContent, SGK_URL, type RawRegionContent } from '../../test/fixtures'
import { checkIntegrity } from './integrity'
import { assembleRegionRaw } from './regionFiles'
import { parseRegionContent, parseRegionList } from './parse'
import { checkOutlineIntegrity, parseOutline } from './parseOutline'
import type { SectionId } from '../../types/content'
import { INITIAL_PROGRESS, regionCompletion } from '../progress/progress'
import { checkImageIntegrity, REGION_WIDE_FILE } from '../images/library'
import { parseWebImages } from '../images/parseWebImages'

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
    id: 'q3',
    type: 'map_locate',
    prompt: '?',
    explanation: '.',
    status: 'draft',
    sources: [],
    targetItemId: 'vung-a__x',
    candidateItemIds: ['vung-a__x', 'vung-a__dia-danh-1'],
  } as never)
  const problems = check(raw)
  expect(problems).toContainEqual(expect.stringContaining('relatedIds: không có "vung-a__khong-co"'))
  expect(problems).toContainEqual(expect.stringContaining('không có địa danh "vung-a__x"'))
})

test('map_locate candidates must have location', () => {
  const { raw } = fixture()
  raw.quizzes[0]!.questions.push({
    id: 'q3',
    type: 'map_locate',
    prompt: '?',
    explanation: '.',
    status: 'draft',
    sources: [],
    targetItemId: 'vung-a__khoang-san-1',
    candidateItemIds: ['vung-a__khoang-san-1', 'vung-a__dia-danh-1'],
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
  const regionsDir = path.join(dataDir, 'regions')
  // Vùng chưa có nội dung chỉ có outline.json (kiểm tra ở test dàn ý bên dưới)
  const folders = readdirSync(regionsDir, { withFileTypes: true }).filter(
    (d) => d.isDirectory() && existsSync(path.join(regionsDir, d.name, 'region.json')),
  )
  const contents = folders.map((dir) => {
    const meta = regions.find((r) => r.id === dir.name)
    expect(meta, `thư mục "${dir.name}" chưa khai báo trong regions.json`).toBeDefined()
    const files = Object.fromEntries(
      readdirSync(path.join(regionsDir, dir.name), { recursive: true, encoding: 'utf8' })
        .filter((f) => f.endsWith('.json'))
        .map((f) => [f.split(path.sep).join('/'), JSON.parse(readFileSync(path.join(regionsDir, dir.name, f), 'utf8')) as unknown]),
    )
    return parseRegionContent(assembleRegionRaw(meta, files))
  })
  expect(contents.length).toBeGreaterThan(0)
  expect(checkIntegrity(contents, regions, manifestIds, SGK_URL)).toEqual([])
})

test('real image library in src/data/images passes integrity check', () => {
  const dataDir = path.resolve(import.meta.dirname, '../../data')
  const regions = parseRegionList(JSON.parse(readFileSync(path.join(dataDir, 'regions.json'), 'utf8')))
  const provinces = JSON.parse(readFileSync(path.join(dataDir, 'provinces.json'), 'utf8')) as { id: string; regionId: string }[]
  const regionsDir = path.join(dataDir, 'regions')
  const contents = readdirSync(regionsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(regionsDir, d.name, 'region.json')))
    .map((dir) => {
      const files = Object.fromEntries(
        readdirSync(path.join(regionsDir, dir.name), { recursive: true, encoding: 'utf8' })
          .filter((f) => f.endsWith('.json'))
          .map((f) => [f.split(path.sep).join('/'), JSON.parse(readFileSync(path.join(regionsDir, dir.name, f), 'utf8')) as unknown]),
      )
      return parseRegionContent(
        assembleRegionRaw(
          regions.find((r) => r.id === dir.name),
          files,
        ),
      )
    })
  const imagesDir = path.join(dataDir, 'images')
  const images = readdirSync(imagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((dir) => {
      expect(
        regions.some((r) => r.id === dir.name),
        `thư mục ảnh "${dir.name}" không phải vùng`,
      ).toBe(true)
      return readdirSync(path.join(imagesDir, dir.name))
        .filter((f) => f.endsWith('.json'))
        .flatMap((f) => {
          const name = f.slice(0, -'.json'.length)
          const raw: unknown = JSON.parse(readFileSync(path.join(imagesDir, dir.name, f), 'utf8'))
          return parseWebImages(raw, dir.name, name === REGION_WIDE_FILE ? null : name, `images/${dir.name}/${f}`)
        })
    })
  expect(checkImageIntegrity(images, contents, provinces)).toEqual([])
})

test('real outlines in src/data/regions pass integrity', () => {
  const dataDir = path.resolve(import.meta.dirname, '../../data')
  const regions = parseRegionList(JSON.parse(readFileSync(path.join(dataDir, 'regions.json'), 'utf8')))
  for (const region of regions) {
    const dir = path.join(dataDir, 'regions', region.id)
    const outline = parseOutline(JSON.parse(readFileSync(path.join(dir, 'outline.json'), 'utf8')), region.id, `${region.id}/outline.json`)
    expect(outline.sections.map((s) => s.id)).toEqual(['thien-nhien', 'dan-cu-san-xuat', 'van-hoa', 'lich-su'])
    let items: { id: string; section: SectionId }[] = []
    if (existsSync(path.join(dir, 'region.json'))) {
      const files = Object.fromEntries(
        readdirSync(dir, { recursive: true, encoding: 'utf8' })
          .filter((f) => f.endsWith('.json'))
          .map((f) => [f.split(path.sep).join('/'), JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as unknown]),
      )
      items = parseRegionContent(assembleRegionRaw(region, files)).items
    }
    expect(checkOutlineIntegrity(outline, items)).toEqual([])
  }
})

test('progress saved under old item ids still counts', () => {
  const dataDir = path.resolve(import.meta.dirname, '../../data')
  const regions = parseRegionList(JSON.parse(readFileSync(path.join(dataDir, 'regions.json'), 'utf8')))
  const dir = path.join(dataDir, 'regions', 'trung-du-mien-nui-phia-bac')
  const files = Object.fromEntries(
    readdirSync(dir, { recursive: true, encoding: 'utf8' })
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f.split(path.sep).join('/'), JSON.parse(readFileSync(path.join(dir, f), 'utf8')) as unknown]),
  )
  const content = parseRegionContent(assembleRegionRaw(regions[0], files))
  // id mục lưu trong LocalStorage trước khi có dàn ý (topics/<chủ đề>.json)
  const oldIds = ['den-hung', 'khoang-san', 'cot-co-lung-cu', 'le-hoi', 'ruong-bac-thang'].map((s) => `trung-du-mien-nui-phia-bac__${s}`)
  const ids = new Set(content.items.map((i) => i.id))
  for (const id of oldIds) expect(ids.has(id), id).toBe(true)
  expect(regionCompletion({ ...INITIAL_PROGRESS, viewedItemIds: oldIds }, content)).toBeGreaterThan(0)
})
