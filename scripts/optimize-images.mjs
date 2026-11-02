// Nén ảnh gốc trong assets-src/images thành AVIF + WebP nhiều kích thước
// và ghi src/data/image-manifest.json (kích thước gốc, các width, ảnh mờ LQIP).
// Tên file gốc (không đuôi) chính là imageId dùng trong nội dung JSON.
//
// Chạy: npm run images
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_DIR = path.join(ROOT, 'assets-src/images')
const OUT_DIR = path.join(ROOT, 'public/images')
const MANIFEST = path.join(ROOT, 'src/data/image-manifest.json')

const WIDTHS = [320, 640, 1024, 1600]
const AVIF_QUALITY = 50
const WEBP_QUALITY = 72
const MAX_SOURCE_PX = 4000
const MAX_OUTPUT_BYTES = 250 * 1024
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const INPUT_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp'])

async function isFresh(outFile, srcMtime) {
  try {
    return (await stat(outFile)).mtimeMs >= srcMtime
  } catch {
    return false
  }
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'))
  } catch {
    return {}
  }
}

async function processImage(file, previous) {
  const id = path.parse(file).name
  if (!ID_PATTERN.test(id)) {
    console.warn(`⚠ Bỏ qua "${file}": tên file phải là chữ thường không dấu, nối bằng "-"`)
    return null
  }
  const srcPath = path.join(SRC_DIR, file)
  const srcMtime = (await stat(srcPath)).mtimeMs
  const { width, height } = await sharp(srcPath).rotate().metadata()
  if (!width || !height) throw new Error(`Không đọc được kích thước ảnh ${file}`)
  if (Math.max(width, height) > MAX_SOURCE_PX) {
    console.warn(`⚠ ${file}: ảnh gốc ${width}×${height}px, nên thu nhỏ còn ≤ ${MAX_SOURCE_PX}px`)
  }

  // Không phóng to quá ảnh gốc; luôn có ít nhất một width.
  const widths = WIDTHS.filter((w) => w <= width)
  if (widths.length === 0) widths.push(width)
  const outHeight = Math.round((height * widths[widths.length - 1]) / width)

  for (const w of widths) {
    for (const format of ['avif', 'webp']) {
      const outFile = path.join(OUT_DIR, `${id}-${w}.${format}`)
      if (await isFresh(outFile, srcMtime)) continue
      const pipeline = sharp(srcPath).rotate().resize({ width: w, withoutEnlargement: true })
      const info = await (format === 'avif'
        ? pipeline.avif({ quality: AVIF_QUALITY, effort: 6 })
        : pipeline.webp({ quality: WEBP_QUALITY, effort: 6 })
      ).toFile(outFile)
      if (info.size > MAX_OUTPUT_BYTES) {
        console.warn(`⚠ ${path.basename(outFile)} nặng ${Math.round(info.size / 1024)}KB (> 250KB)`)
      }
    }
  }

  const prev = previous[id]
  const lqip =
    prev && prev.widths?.join() === widths.join() && (await isFresh(path.join(OUT_DIR, `${id}-${widths[0]}.webp`), srcMtime))
      ? prev.lqip
      : `data:image/webp;base64,${(
          await sharp(srcPath).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer()
        ).toString('base64')}`

  return [id, { width: widths[widths.length - 1], height: outHeight, widths, lqip }]
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  let files = []
  try {
    files = (await readdir(SRC_DIR)).filter((f) => INPUT_EXT.has(path.extname(f).toLowerCase())).sort()
  } catch {
    console.log(`Chưa có thư mục ${path.relative(ROOT, SRC_DIR)}, không có ảnh để xử lý.`)
  }
  const previous = await readManifest()
  const manifest = {}
  for (const file of files) {
    const entry = await processImage(file, previous)
    if (entry) manifest[entry[0]] = entry[1]
  }
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`✓ Đã xử lý ${Object.keys(manifest).length} ảnh → ${path.relative(ROOT, MANIFEST)}`)
}

await main()
