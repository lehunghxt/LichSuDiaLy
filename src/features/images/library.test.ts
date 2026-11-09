import { parseRegionContent } from '../content/parse'
import { rawRegionContent } from '../../test/fixtures'
import type { WebImage } from '../../types/content'
import { checkImageIntegrity, createImageLibrary, interleaveByProvince } from './library'

const R = 'trung-du-mien-nui-phia-bac'

function img(id: string, provinceId: string | null, over: Partial<Record<string, unknown>> = {}) {
  return {
    id,
    provider: 'wikimedia-commons',
    provinceId,
    section: 'thien-nhien',
    itemIds: [],
    alt: 'a',
    caption: 'c',
    src: { url: 'https://upload.wikimedia.org/wikipedia/commons/a.jpg', width: 4, height: 3, srcset: [] },
    attribution: {
      title: 'File:a.jpg',
      author: 'A',
      license: 'Public domain',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:a.jpg',
    },
    status: 'verified',
    ...over,
  }
}

const mod = (v: unknown) => () => Promise.resolve({ default: v })

function lib() {
  return createImageLibrary({
    [`../../data/images/${R}/_toan-vung.json`]: mod([img('_toan-vung__a', null, { section: 'van-hoa' })]),
    [`../../data/images/${R}/phu-tho.json`]: mod([img('phu-tho__a', 'phu-tho', { itemIds: [`${R}__den-hung`], section: 'lich-su' })]),
    [`../../data/images/${R}/lao-cai.json`]: mod([
      img('lao-cai__a', 'lao-cai', { status: 'draft', section: 'van-hoa' }),
      img('lao-cai__b', 'lao-cai'),
    ]),
    '../../data/images/nam-bo/can-tho.json': mod([img('can-tho__a', 'can-tho')]),
  })
}

afterEach(() => vi.unstubAllEnvs())

test('loadRegion merges province files and region-wide file, ordered by provinces.json, region-wide last', async () => {
  const images = await lib().loadRegion(R)
  expect(images.map((i) => i.id)).toEqual(['lao-cai__a', 'lao-cai__b', 'phu-tho__a', '_toan-vung__a'])
  expect(images.every((i) => i.regionId === R)).toBe(true)
})

test('region without image files loads empty', async () => {
  expect(await lib().loadRegion('dong-bang-bac-bo')).toEqual([])
})

test('drafts are hidden in PROD', async () => {
  vi.stubEnv('PROD', true)
  expect((await lib().loadRegion(R)).map((i) => i.id)).not.toContain('lao-cai__a')
})

test('drafts shown in development', async () => {
  vi.stubEnv('PROD', false)
  expect((await lib().loadRegion(R)).map((i) => i.id)).toContain('lao-cai__a')
})

test('loadAll returns images of every region', async () => {
  expect((await lib().loadAll()).map((i) => i.id)).toContain('can-tho__a')
})

test('forItem, forProvince and regionCover', async () => {
  const l = lib()
  const images = await l.loadRegion(R)
  expect(l.forItem(images, `${R}__den-hung`).map((i) => i.id)).toEqual(['phu-tho__a'])
  expect(l.forProvince(images, 'lao-cai').map((i) => i.id)).toEqual(['lao-cai__a', 'lao-cai__b'])
  // ưu tiên ảnh thiên nhiên, rồi ảnh bất kì
  expect(l.regionCover(images)?.id).toBe('lao-cai__b')
  expect(l.regionCover(images.filter((i) => i.id !== 'lao-cai__b'))?.id).toBe('lao-cai__a')
})

const provinces = [
  { id: 'lao-cai', regionId: R },
  { id: 'can-tho', regionId: 'nam-bo' },
]

function webImage(over: Partial<WebImage>): WebImage {
  return {
    id: 'x',
    provider: 'wikimedia-commons',
    regionId: 'vung-a',
    provinceId: null,
    section: 'thien-nhien',
    itemIds: [],
    alt: 'a',
    caption: 'c',
    src: { url: 'u', width: 1, height: 1, srcset: [] },
    attribution: { title: 't', author: 'a', license: 'Public domain', sourceUrl: 's' },
    status: 'draft',
    ...over,
  }
}

test('checkImageIntegrity reports wrong province region, unknown items, duplicate ids', () => {
  const content = parseRegionContent(rawRegionContent())
  const problems = checkImageIntegrity(
    [
      webImage({ id: 'a', itemIds: ['vung-a__dia-danh-1'] }),
      webImage({ id: 'a' }),
      webImage({ id: 'b', provinceId: 'can-tho' }),
      webImage({ id: 'c', provinceId: 'khong-co' }),
      webImage({ id: 'd', itemIds: ['vung-a__khong-co'] }),
      webImage({ id: 'e', regionId: 'nam-bo', provinceId: 'can-tho', itemIds: ['nam-bo__x'] }),
    ],
    [content],
    provinces,
  )
  expect(problems).toEqual([
    'ảnh: trùng id "a"',
    'b: tỉnh "can-tho" không thuộc vùng "vung-a"',
    'c: không có tỉnh "khong-co"',
    'd.itemIds: không có mục "vung-a__khong-co"',
    'e.itemIds: vùng "nam-bo" chưa có nội dung nên không gắn được "nam-bo__x"',
  ])
})

test('regionCover prefers a nature image tied to an SGK item over an earlier untied one', () => {
  const l = lib()
  const images = [
    webImage({ id: 'a', section: 'thien-nhien', itemIds: [] }),
    webImage({ id: 'b', section: 'van-hoa', itemIds: ['vung-a__x'] }),
    webImage({ id: 'c', section: 'thien-nhien', itemIds: ['vung-a__y'] }),
  ]
  expect(l.regionCover(images)?.id).toBe('c')
  expect(l.regionCover(images.filter((i) => i.id !== 'c'))?.id).toBe('a')
})

test('interleaveByProvince takes one image per province in turn, keeping order inside each province', () => {
  const images = [
    webImage({ id: 'hn1', provinceId: 'ha-noi' }),
    webImage({ id: 'hn2', provinceId: 'ha-noi' }),
    webImage({ id: 'hn3', provinceId: 'ha-noi' }),
    webImage({ id: 'qn1', provinceId: 'quang-ninh' }),
    webImage({ id: 'v1', provinceId: null }),
    webImage({ id: 'qn2', provinceId: 'quang-ninh' }),
  ]
  expect(interleaveByProvince(images).map((i) => i.id)).toEqual(['hn1', 'qn1', 'v1', 'hn2', 'qn2', 'hn3'])
})

test('regionCover uses the image marked as cover first', () => {
  const l = createImageLibrary({})
  const images = [
    webImage({ id: 'a', section: 'thien-nhien', itemIds: ['vung-a__x'] }),
    webImage({ id: 'b', section: 'van-hoa', cover: true }),
  ]
  expect(l.regionCover(images)?.id).toBe('b')
})
