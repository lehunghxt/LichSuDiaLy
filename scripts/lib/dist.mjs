// Kiểm tra bản build trong dist/: file cần có, kích thước chunk ban đầu, leaflet phải tải sau,
// Trang chủ không tải kèm phần của trang bản đồ, ảnh không quá nặng.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

export const ENTRY_LIMIT_KB = 150
export const IMAGE_LIMIT_KB = 250
// Chuỗi chỉ có trong mã nguồn Leaflet (dòng ghi công mặc định)
const LEAFLET_MARK = 'leafletjs.com'
// Chuỗi chỉ có trong khung thông tin bản đồ (nút quay về toàn quốc): Trang chủ không cần tải phần này
const MAP_PANEL_MARK = 'Về bản đồ Việt Nam'

const kb = (bytes) => Math.round(bytes / 1024)

function listFiles(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { recursive: true })
    .map((f) => String(f))
    .filter((f) => statSync(path.join(dir, f)).isFile())
}

/** Các chunk JS tải ngay khi mở trang: script module và modulepreload trong index.html */
function entryChunks(html) {
  const refs = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"|<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g)]
  return refs.map((m) => path.basename(m[1] ?? m[2]))
}

/** Các chunk một chunk kéo theo khi tải (import tĩnh, đệ quy), kể cả chính nó */
function staticClosure(assetsDir, start) {
  const seen = new Set()
  const visit = (name) => {
    const file = path.join(assetsDir, name)
    if (seen.has(name) || !existsSync(file)) return
    seen.add(name)
    for (const m of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*"\.\/([^"]+\.js)"/g)) visit(m[1])
  }
  visit(start)
  return [...seen]
}

/** Trả về danh sách vấn đề; rỗng nghĩa là bản build đạt */
export function checkDist(distDir) {
  const problems = []
  const indexFile = path.join(distDir, 'index.html')
  if (!existsSync(indexFile)) problems.push('thiếu dist/index.html')
  if (!existsSync(path.join(distDir, '_redirects'))) problems.push('thiếu dist/_redirects')

  if (existsSync(indexFile)) {
    let gzipBytes = 0
    for (const name of entryChunks(readFileSync(indexFile, 'utf8'))) {
      const file = path.join(distDir, 'assets', name)
      if (!existsSync(file)) continue
      const code = readFileSync(file)
      gzipBytes += gzipSync(code).length
      if (code.includes(LEAFLET_MARK)) problems.push(`leaflet nằm trong chunk ban đầu: ${name}`)
    }
    if (kb(gzipBytes) > ENTRY_LIMIT_KB) problems.push(`chunk ban đầu ${kb(gzipBytes)}KB gzip, vượt ${ENTRY_LIMIT_KB}KB`)
  }

  const assetsDir = path.join(distDir, 'assets')
  const home = listFiles(assetsDir).find((f) => /^HomePage-[\w-]+\.js$/.test(f))
  for (const name of home ? staticClosure(assetsDir, home) : []) {
    if (readFileSync(path.join(assetsDir, name), 'utf8').includes(MAP_PANEL_MARK)) {
      problems.push(`Trang chủ tải kèm khung thông tin bản đồ: ${name}`)
    }
  }

  const imagesDir = path.join(distDir, 'images')
  for (const f of listFiles(imagesDir)) {
    const size = statSync(path.join(imagesDir, f)).size
    if (kb(size) > IMAGE_LIMIT_KB) problems.push(`ảnh quá ${IMAGE_LIMIT_KB}KB: images/${f.split(path.sep).join('/')} (${kb(size)}KB)`)
  }
  return problems
}
