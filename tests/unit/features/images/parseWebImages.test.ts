import { ContentError } from '../../../../src/lib/validate'
import { parseWebImages } from '../../../../src/features/images/parseWebImages'

const REGION = 'trung-du-mien-nui-phia-bac'
const FILE = 'images/trung-du-mien-nui-phia-bac/lao-cai.json'

function raw(over: Record<string, unknown> = {}, attribution: Record<string, unknown> = {}) {
  return [
    {
      id: 'lao-cai__fansipan',
      provider: 'wikimedia-commons',
      provinceId: 'lao-cai',
      section: 'thien-nhien',
      itemIds: ['trung-du-mien-nui-phia-bac__dinh-phan-xi-pang'],
      alt: 'Chóp đỉnh Phan-xi-păng',
      caption: 'Đỉnh Phan-xi-păng (tỉnh Lào Cai).',
      src: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg/960px-F.jpg',
        width: 960,
        height: 640,
        srcset: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg/500px-F.jpg', width: 500 }],
      },
      attribution: {
        title: 'File:F.jpg',
        author: 'Tác giả',
        authorUrl: 'https://commons.wikimedia.org/wiki/User:X',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:F.jpg',
        ...attribution,
      },
      status: 'draft',
      ...over,
    },
  ]
}

const parse = (v: unknown, province: string | null = 'lao-cai') => parseWebImages(v, REGION, province, FILE)

function errorPath(fn: () => unknown): string {
  try {
    fn()
  } catch (e) {
    if (e instanceof ContentError) return e.path
    throw e
  }
  throw new Error('không ném lỗi')
}

test('parses a valid commons image', () => {
  const [img] = parse(raw())
  expect(img?.regionId).toBe(REGION)
  expect(img?.provinceId).toBe('lao-cai')
  expect(img?.attribution.authorUrl).toBe('https://commons.wikimedia.org/wiki/User:X')
  expect(img?.src.srcset).toHaveLength(1)
})

test('rejects non-commons src host', () => {
  expect(errorPath(() => parse(raw({ src: { url: 'https://example.com/a.jpg', width: 1, height: 1, srcset: [] } })))).toBe(
    `${FILE}[0].src.url`,
  )
})

test('rejects srcset entries from another host', () => {
  const src = {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a.jpg',
    width: 1,
    height: 1,
    srcset: [{ url: 'https://x.org/a.jpg', width: 5 }],
  }
  expect(errorPath(() => parse(raw({ src })))).toBe(`${FILE}[0].src.srcset[0].url`)
})

test('rejects sourceUrl that is not a commons File page', () => {
  expect(errorPath(() => parse(raw({}, { sourceUrl: 'https://vnexpress.net/anh' })))).toBe(`${FILE}[0].attribution.sourceUrl`)
})

test.each(['CC BY-NC-SA 2.0', 'CC BY-ND 4.0', 'GFDL', 'Attribution', ''])('rejects license "%s"', (license) => {
  expect(() => parse(raw({}, { license }))).toThrow(ContentError)
})

test.each(['Public domain', 'CC0', 'CC0 1.0', 'CC BY 2.0', 'CC BY-SA 4.0', 'CC BY-SA 3.0 igo'])('accepts license "%s"', (license) => {
  expect(parse(raw({}, { license }))[0]?.attribution.license).toBe(license)
})

test('requires licenseUrl unless Public domain', () => {
  expect(errorPath(() => parse(raw({}, { licenseUrl: undefined })))).toBe(`${FILE}[0].attribution.licenseUrl`)
  expect(parse(raw({}, { license: 'Public domain', licenseUrl: undefined }))[0]?.attribution.licenseUrl).toBeUndefined()
})

test("provinceId in JSON must equal the file's province", () => {
  expect(errorPath(() => parse(raw({ provinceId: 'phu-tho' })))).toBe(`${FILE}[0].provinceId`)
})

test('region-wide file requires provinceId null', () => {
  expect(parse(raw({ provinceId: null }), null)[0]?.provinceId).toBeNull()
  expect(errorPath(() => parse(raw(), null))).toBe(`${FILE}[0].provinceId`)
})

test('section must be a topic section', () => {
  expect(errorPath(() => parse(raw({ section: 'phong-tuc' })))).toBe(`${FILE}[0].section`)
})

test('optional cover flag must be true when present', () => {
  expect(parse(raw())[0]?.cover).toBeUndefined()
  expect(parse(raw({ cover: true }))[0]?.cover).toBe(true)
  expect(() => parse(raw({ cover: 'yes' }))).toThrow(ContentError)
})
