import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { checkDist } from '../../../../scripts/lib/dist.mjs'

let dir
const write = (rel, content) => {
  const file = path.join(dir, rel)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, content)
}
const html = (entry = 'index-abc.js', preload = []) =>
  `<!doctype html><html lang="vi"><head><script type="module" src="/assets/${entry}"></script>${preload
    .map((p) => `<link rel="modulepreload" href="/assets/${p}">`)
    .join('')}</head></html>`

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'dist-'))
  write('index.html', html('index-abc.js', ['vendor-1.js']))
  write('_redirects', '/* /index.html 200\n')
  write('_headers', '/assets/*\n  Cache-Control: immutable\n')
  write('sw.js', 'const BASE = "/"\nconst PRECACHE = ["/index.html","/assets/index-abc.js"]\n')
  write('assets/index-abc.js', 'console.log("app")')
  write('assets/vendor-1.js', 'export const x = 1')
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

test('a small dist with redirects passes', () => {
  expect(checkDist(dir)).toEqual([])
})

test('missing index.html or _redirects is reported', () => {
  rmSync(path.join(dir, '_redirects'))
  expect(checkDist(dir)).toContain('thiếu dist/_redirects')
  rmSync(path.join(dir, 'index.html'))
  expect(checkDist(dir)).toContain('thiếu dist/index.html')
})

test('entry chunks over 150KB gzip are reported', () => {
  // Dữ liệu ngẫu nhiên gần như không nén được
  let s = ''
  for (let i = 0; i < 260_000; i++) s += String.fromCharCode(33 + Math.floor(Math.random() * 90))
  write('assets/vendor-1.js', s)
  expect(checkDist(dir).some((p) => p.startsWith('chunk ban đầu'))).toBe(true)
})

test('leaflet in an entry chunk is reported, in a lazy chunk it is fine', () => {
  write('assets/map-lazy.js', '/* Leaflet https://leafletjs.com */')
  expect(checkDist(dir)).toEqual([])
  write('assets/vendor-1.js', '/* Leaflet https://leafletjs.com */')
  expect(checkDist(dir)).toContain('leaflet nằm trong chunk ban đầu: vendor-1.js')
})

test('images over 250KB in dist/images are reported', () => {
  write('images/small.avif', Buffer.alloc(1000))
  write('images/big/photo.webp', Buffer.alloc(260 * 1024))
  expect(checkDist(dir)).toEqual(['ảnh quá 250KB: images/big/photo.webp (260KB)'])
})

test('the home page must not load the map info panel (it only belongs to the map page)', () => {
  write('assets/HomePage-aaa.js', 'import{a}from"./shared-1.js";export default a')
  write('assets/shared-1.js', 'import"./inner-2.js";export const a=1')
  write('assets/inner-2.js', 'export const b=2')
  write('assets/MapPage-bbb.js', 'const t="Về bản đồ Việt Nam"')
  expect(checkDist(dir)).toEqual([])
  write('assets/inner-2.js', 'const t="Về bản đồ Việt Nam"')
  expect(checkDist(dir)).toContain('Trang chủ tải kèm khung thông tin bản đồ: inner-2.js')
})

test('the service worker must exist and only precache files that are in the build', () => {
  write('sw.js', 'const BASE = "/"\nconst PRECACHE = ["/index.html","/assets/gone-123.js"]\n')
  expect(checkDist(dir)).toEqual(['sw.js lưu sẵn file không có: /assets/gone-123.js'])
  rmSync(path.join(dir, 'sw.js'))
  rmSync(path.join(dir, '_headers'))
  expect(checkDist(dir)).toEqual(['thiếu dist/_headers', 'thiếu dist/sw.js'])
})
