// Kiểm tra bản build sau `npm run build`: node scripts/check-dist.mjs [thư mục dist]
import path from 'node:path'
import { ENTRY_LIMIT_KB, IMAGE_LIMIT_KB, checkDist } from './lib/dist.mjs'

const distDir = path.resolve(import.meta.dirname, '..', process.argv[2] ?? 'dist')
const problems = checkDist(distDir)
if (problems.length > 0) {
  console.error(`Bản build chưa đạt (${problems.length} vấn đề):`)
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}
console.log(`Bản build đạt: chunk ban đầu < ${ENTRY_LIMIT_KB}KB gzip, leaflet tải sau, Trang chủ không tải khung bản đồ, ảnh ≤ ${IMAGE_LIMIT_KB}KB.`)
