// Kiểm tra bản build trong dist/: file cần có, kích thước chunk ban đầu, leaflet phải tải sau, ảnh không quá nặng.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

export const ENTRY_LIMIT_KB = 150
export const IMAGE_LIMIT_KB = 250
// Chuỗi chỉ có trong mã nguồn Leaflet (dòng ghi công mặc định)
const LEAFLET_MARK = 'leafletjs.com'

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

  const imagesDir = path.join(distDir, 'images')
  for (const f of listFiles(imagesDir)) {
    const size = statSync(path.join(imagesDir, f)).size
    if (kb(size) > IMAGE_LIMIT_KB) problems.push(`ảnh quá ${IMAGE_LIMIT_KB}KB: images/${f.split(path.sep).join('/')} (${kb(size)}KB)`)
  }
  return problems
}
