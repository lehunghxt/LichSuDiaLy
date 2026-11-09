// Sinh dist/sw.js lúc build (plugin trong vite.config.ts): lưu sẵn mã, phông chữ, bản đồ để lần sau mở nhanh
// và vẫn dùng được khi mất mạng. Ảnh, video ở Wikimedia/YouTube không lưu (khác tên miền, quá nặng).
import { createHash } from 'node:crypto'

// File trong dist được lưu sẵn: mã, kiểu, phông woff2 (trình duyệt nay đều đọc woff2, bỏ woff), dữ liệu bản đồ
const PRECACHE = /^(?:index\.html|assets\/.+\.(?:js|css|woff2)|maps\/.+\.geojson)$/

/** Các đường dẫn (tương đối với base) cần lưu sẵn, theo thứ tự chữ cái */
export function precacheList(files) {
  return files.filter((f) => PRECACHE.test(f)).sort()
}

/** Phiên bản theo nội dung danh sách lưu sẵn: tên file có hash, nên đổi mã là đổi phiên bản */
export function cacheVersion(list) {
  return createHash('sha256').update(list.join('\n')).digest('hex').slice(0, 12)
}

/**
 * Mã nguồn sw.js.
 * - Trang (điều hướng): mạng trước, mất mạng thì trả index.html đã lưu.
 * - /assets/: tên có hash, không đổi → lấy từ bộ nhớ trước.
 * - /maps/: lấy bản đã lưu cho nhanh, đồng thời tải bản mới cất cho lần sau.
 * Không gọi skipWaiting: bản mới chờ đến khi đóng hết các tab cũ, để trang đang mở không lẫn mã hai phiên bản.
 */
export function serviceWorkerSource({ base, files }) {
  const list = precacheList(files)
  const version = cacheVersion(list)
  return `// Sinh tự động khi build (scripts/lib/service-worker.mjs), không sửa tay
const BASE = ${JSON.stringify(base)}
const CACHE = 'em-kham-pha-${version}'
const PRECACHE = ${JSON.stringify(list.map((f) => base + f))}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('em-kham-pha-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// ignoreVary: máy chủ có thể trả "Vary: Origin", mà trình duyệt gửi kèm Origin khi tải module JS còn lúc lưu sẵn thì không
// → không bỏ qua Vary thì không khớp bản đã lưu, mất mạng là trang trắng. File ở đây không đổi theo Origin
const fromCache = (request) => caches.open(CACHE).then((cache) => cache.match(request, { ignoreVary: true }))
const store = (request, response) => {
  if (response.ok) {
    const copy = response.clone()
    caches.open(CACHE).then((cache) => cache.put(request, copy))
  }
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => fromCache(BASE + 'index.html').then((r) => r || Response.error())))
    return
  }
  const rest = url.pathname.slice(BASE.length)
  if (rest.startsWith('assets/')) {
    event.respondWith(fromCache(request).then((hit) => hit || fetch(request).then((r) => store(request, r))))
    return
  }
  if (rest.startsWith('maps/')) {
    event.respondWith(
      fromCache(request).then((hit) => {
        const fresh = fetch(request).then((r) => store(request, r))
        if (hit) {
          event.waitUntil(fresh.catch(() => undefined))
          return hit
        }
        return fresh
      }),
    )
  }
})
`
}
