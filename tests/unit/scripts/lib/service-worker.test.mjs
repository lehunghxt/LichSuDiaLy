import { cacheVersion, precacheList, serviceWorkerSource } from '../../../../scripts/lib/service-worker.mjs'

const files = [
  'index.html',
  'assets/index-abc.js',
  'assets/index-abc.css',
  'assets/font-400.woff2',
  'assets/font-400.woff',
  'maps/regions.geojson',
  'favicon.svg',
  '_redirects',
  'sw.js',
]

test('precache: the page, code, styles, woff2 fonts and map data; not old woff fonts, icons or config files', () => {
  expect(precacheList(files)).toEqual([
    'assets/font-400.woff2',
    'assets/index-abc.css',
    'assets/index-abc.js',
    'index.html',
    'maps/regions.geojson',
  ])
})

test('the cache version changes when a hashed file changes', () => {
  const list = precacheList(files)
  expect(cacheVersion(list)).toBe(cacheVersion([...list]))
  expect(cacheVersion(list)).not.toBe(cacheVersion(list.map((f) => f.replace('abc', 'def'))))
})

test('the worker lists files under the base path and waits for old tabs to close before taking over', () => {
  const src = serviceWorkerSource({ base: '/hoc/', files })
  expect(src).toContain('"/hoc/assets/index-abc.js"')
  expect(src).toContain('"/hoc/index.html"')
  expect(src).not.toContain('skipWaiting')
  // Module JS được tải kèm header Origin: tra bộ nhớ phải bỏ qua Vary, nếu không mất mạng sẽ ra trang trắng
  expect(src).toContain('ignoreVary: true')
  // Mã sinh ra phải chạy được
  expect(() => new Function(src)).not.toThrow()
})
