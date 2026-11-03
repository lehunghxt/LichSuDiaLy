// Kiểm tra link hỏng trong thư viện ảnh nhúng (ảnh có thể bị xoá hoặc đổi tên trên Commons).
//   node scripts/commons-check.mjs [regionId]     không truyền vùng thì kiểm tra tất cả
// Chạy trước mỗi lần deploy. Có link hỏng thì thoát với mã 1.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { USER_AGENT } from './lib/commons.mjs'

const dir = path.resolve(import.meta.dirname, '../src/data/images')
const only = process.argv[2]
const regions = readdirSync(dir).filter((r) => !only || r === only)
if (only && regions.length === 0) {
  console.error(`Không có thư mục ảnh cho vùng "${only}"`)
  process.exit(1)
}

const checks = []
for (const region of regions) {
  for (const file of readdirSync(path.join(dir, region)).filter((f) => f.endsWith('.json'))) {
    for (const img of JSON.parse(readFileSync(path.join(dir, region, file), 'utf8'))) {
      const urls = new Set([img.src.url, ...img.src.srcset.map((s) => s.url), img.attribution.sourceUrl])
      for (const url of urls) checks.push({ id: img.id, url })
    }
  }
}

const broken = []
let next = 0
async function worker() {
  while (next < checks.length) {
    const c = checks[next++]
    try {
      const res = await fetch(c.url, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } })
      if (!res.ok) broken.push({ ...c, why: `HTTP ${res.status}` })
    } catch (e) {
      broken.push({ ...c, why: String(e) })
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker))

console.log(`Đã kiểm tra ${checks.length} link${only ? ` của vùng ${only}` : ''}.`)
if (broken.length) {
  console.log(`${broken.length} link hỏng:`)
  for (const b of broken) console.log(`  - ${b.id}: ${b.why} ${b.url}`)
  process.exit(1)
}
console.log('Không có link hỏng.')
