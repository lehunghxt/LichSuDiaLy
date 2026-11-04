import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ALLOWED_LICENSE as TS_ALLOWED } from '../../src/features/images/parseWebImages'
import { parseWebImages } from '../../src/features/images/parseWebImages'
import { ALLOWED_LICENSE, apiUrl, canonicalUrl, cleanArtist, mergeStatus, normalizeLicense, slugify, thumbSet, toWebImage } from './commons.mjs'

const fixture = JSON.parse(readFileSync(path.join(import.meta.dirname, '__fixtures__/commons-query.json'), 'utf8'))
const page = (title) => fixture.query.pages.find((p) => p.title === title)
const pick = (over = {}) => ({
  file: 'File:Hoàng Liên Sơn mountains 04.jpg',
  provinceId: 'lao-cai',
  section: 'thien-nhien',
  itemIds: ['trung-du-mien-nui-phia-bac__dia-hinh-doi-nui'],
  alt: 'Dãy núi Hoàng Liên Sơn nhìn từ đường mòn',
  caption: 'Dãy Hoàng Liên Sơn (tỉnh Lào Cai).',
  checked: '2026-11-03: đã xem ảnh, đúng chủ thể',
  ...over,
})

test('license allowlist is the same as the app parser', () => {
  expect(ALLOWED_LICENSE.source).toBe(TS_ALLOWED.source)
})

test('apiUrl asks imageinfo with url, size, extmetadata at 960px', () => {
  const u = new URL(apiUrl(['File:A.jpg', 'File:B.jpg']))
  expect(u.origin).toBe('https://commons.wikimedia.org')
  expect(u.searchParams.get('titles')).toBe('File:A.jpg|File:B.jpg')
  expect(u.searchParams.get('iiprop')).toBe('url|size|extmetadata')
  expect(u.searchParams.get('iiurlwidth')).toBe('960')
})

test('cleanArtist strips html and keeps the first link', () => {
  expect(cleanArtist('<a href="//commons.wikimedia.org/wiki/User:X">X</a> (talk)')).toEqual({
    author: 'X (talk)',
    authorUrl: 'https://commons.wikimedia.org/wiki/User:X',
  })
  expect(cleanArtist('  Nguyễn&nbsp;Văn   A\n')).toEqual({ author: 'Nguyễn Văn A' })
})

test('normalizeLicense keeps allowed licenses and rejects others', () => {
  expect(normalizeLicense('CC BY-SA 4.0')).toBe('CC BY-SA 4.0')
  expect(normalizeLicense('cc-by-sa-3.0')).toBe('CC BY-SA 3.0')
  expect(normalizeLicense('CC BY-NC 2.0')).toBeNull()
  expect(normalizeLicense('Public domain')).toBe('Public domain')
  expect(normalizeLicense('pd')).toBe('Public domain')
  expect(normalizeLicense('CC0')).toBe('CC0')
  expect(normalizeLicense('GFDL')).toBeNull()
})

test('canonicalUrl moves thumbs to upload.wikimedia.org and drops query', () => {
  expect(canonicalUrl('https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg/960px-F.jpg?utm_source=x')).toBe(
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg/960px-F.jpg',
  )
})

test('thumbSet uses standard buckets below the original, plus small originals', () => {
  const thumb = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg/960px-F.jpg'
  const orig = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/F.jpg'
  expect(thumbSet(thumb, 5000, orig).map((s) => s.width)).toEqual([500, 960, 1280])
  expect(thumbSet(thumb, 800, orig)).toEqual([
    { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg/500px-F.jpg', width: 500 },
    { url: orig, width: 800 },
  ])
})

test('slugify makes ascii ids', () => {
  expect(slugify('File:Hoàng Liên Sơn mountains 04.jpg')).toBe('hoang-lien-son-mountains-04')
  expect(slugify('File:Đền Hùng, đền Thượng.jpg')).toBe('den-hung-den-thuong')
})

test('toWebImage builds an image the app parser accepts', () => {
  const { image, skip } = toWebImage(pick(), page('File:Hoàng Liên Sơn mountains 04.jpg'))
  expect(skip).toBeUndefined()
  expect(image.id).toBe('lao-cai__hoang-lien-son-mountains-04')
  expect(image.attribution).toMatchObject({
    author: 'Christophe95',
    authorUrl: 'https://commons.wikimedia.org/wiki/User:Christophe95',
    license: 'CC BY-SA 4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ho%C3%A0ng_Li%C3%AAn_S%C6%A1n_mountains_04.jpg',
  })
  expect(image.src.url).toMatch(/^https:\/\/upload\.wikimedia\.org\/.+\/960px-/)
  expect(image.src.height).toBe(Math.round((3888 * 960) / 5184))
  expect(image.status).toBe('draft')
  expect(parseWebImages([image], 'trung-du-mien-nui-phia-bac', 'lao-cai', 'x')).toHaveLength(1)
})

test('toWebImage: public domain without license url is accepted', () => {
  const { image } = toWebImage(pick({ file: 'File:Fansipan summit new.jpg' }), page('File:Fansipan summit new.jpg'))
  expect(image.attribution.license).toBe('Public domain')
  expect(image.attribution.author).toMatch(/^Thái Nhi/)
  expect(parseWebImages([image], 'trung-du-mien-nui-phia-bac', 'lao-cai', 'x')).toHaveLength(1)
})

test('toWebImage skips missing files, unchecked picks and rejected licenses', () => {
  expect(toWebImage(pick({ file: 'File:Khong co file nay abc.jpg' }), page('File:Khong co file nay abc.jpg')).skip).toBe('file không tồn tại')
  expect(toWebImage(pick({ checked: '' }), page('File:Hoàng Liên Sơn mountains 04.jpg')).skip).toBe('chưa xem ảnh (thiếu "checked")')
  const nc = structuredClone(page('File:Hoàng Liên Sơn mountains 04.jpg'))
  nc.imageinfo[0].extmetadata.LicenseShortName.value = 'CC BY-NC-SA 2.0'
  expect(toWebImage(pick(), nc).skip).toBe('giấy phép "CC BY-NC-SA 2.0" không được nhận')
})

test('mergeStatus keeps verified when attribution and file are unchanged', () => {
  const { image } = toWebImage(pick(), page('File:Hoàng Liên Sơn mountains 04.jpg'))
  expect(mergeStatus(image, [{ ...image, status: 'verified' }]).status).toBe('verified')
  const changed = { ...image, status: 'verified', attribution: { ...image.attribution, license: 'CC BY-SA 3.0' } }
  expect(mergeStatus(image, [changed]).status).toBe('draft')
})

test('toWebImage keeps the cover flag only when the pick sets it', () => {
  expect(toWebImage({ ...pick(), cover: true }, page('File:Hoàng Liên Sơn mountains 04.jpg')).image.cover).toBe(true)
  expect(toWebImage(pick(), page('File:Hoàng Liên Sơn mountains 04.jpg')).image).not.toHaveProperty('cover')
})
