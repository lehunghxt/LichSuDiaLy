// Sinh thư viện ảnh nhúng của một vùng từ danh sách ảnh đã chọn:
//
//   node scripts/commons-fetch.mjs <regionId>
//     đọc  image-picks/<regionId>.json
//     ghi  src/data/images/<regionId>/<provinceId>.json và _toan-vung.json
//
//   node scripts/commons-fetch.mjs --show "File:A.jpg" "File:B.jpg"
//     in mô tả, giấy phép, tác giả, link thumbnail để người chọn ảnh xem và viết chú thích.
//
// Tác giả, giấy phép, link gốc lấy từ API Wikimedia Commons, không gõ tay.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { USER_AGENT, apiUrl, cleanArtist, mergeStatus, toWebImage } from './lib/commons.mjs'

const root = path.resolve(import.meta.dirname, '..')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const normTitle = (t) => {
  const s = t.trim().replace(/_/g, ' ')
  return /^file:/i.test(s) ? `File:${s.slice(5)}` : `File:${s}`
}

async function query(titles) {
  const pages = new Map()
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50)
    let res
    for (let attempt = 0; attempt < 4; attempt++) {
      res = await fetch(apiUrl(batch), { headers: { 'User-Agent': USER_AGENT } })
      if (res.status !== 429) break
      await sleep(5000 * (attempt + 1))
    }
    if (!res.ok) throw new Error(`Commons API ${res.status}`)
    const data = await res.json()
    const renamed = new Map((data.query.normalized ?? []).map((n) => [n.to, n.from]))
    for (const p of data.query.pages) {
      pages.set(p.title, p)
      if (renamed.has(p.title)) pages.set(renamed.get(p.title), p)
    }
    if (i + 50 < titles.length) await sleep(1000)
  }
  return pages
}

async function show(titles) {
  const pages = await query(titles.map(normTitle))
  for (const t of titles.map(normTitle)) {
    const p = pages.get(t)
    const ii = p?.imageinfo?.[0]
    if (!ii) {
      console.log(`\n${t}\n  KHÔNG TỒN TẠI`)
      continue
    }
    const m = (k) => cleanArtist(ii.extmetadata?.[k]?.value ?? '').author
    console.log(`\n${p.title}`)
    console.log(`  Giấy phép: ${m('LicenseShortName')} | Tác giả: ${m('Artist') || m('Credit')}`)
    console.log(`  Mô tả: ${m('ImageDescription').slice(0, 400)}`)
    console.log(`  Ngày: ${m('DateTimeOriginal')} | Kích thước: ${ii.width}×${ii.height}`)
    console.log(`  Xem: ${ii.thumburl}`)
  }
}

async function build(regionId) {
  const provinces = JSON.parse(readFileSync(path.join(root, 'src/data/provinces.json'), 'utf8')).filter((p) => p.regionId === regionId)
  if (provinces.length === 0) throw new Error(`Không có tỉnh nào thuộc vùng "${regionId}"`)
  const picks = JSON.parse(readFileSync(path.join(root, 'image-picks', `${regionId}.json`), 'utf8'))
  const outDir = path.join(root, 'src/data/images', regionId)
  mkdirSync(outDir, { recursive: true })

  const pages = await query([...new Set(picks.map((p) => normTitle(p.file)))])
  const groups = new Map()
  const skipped = []
  const ids = new Set()
  for (const pick of picks) {
    const where = pick.provinceId ?? '_toan-vung'
    if (pick.provinceId && !provinces.some((p) => p.id === pick.provinceId)) {
      skipped.push([pick.file, where, `tỉnh không thuộc vùng ${regionId}`])
      continue
    }
    const { image, skip } = toWebImage(pick, pages.get(normTitle(pick.file)))
    if (skip) skipped.push([pick.file, where, skip])
    else if (ids.has(image.id)) skipped.push([pick.file, where, `trùng id ${image.id}`])
    else {
      ids.add(image.id)
      groups.set(where, [...(groups.get(where) ?? []), image])
    }
  }

  const existingFiles = readdirSync(outDir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
  for (const name of new Set([...existingFiles, ...groups.keys(), '_toan-vung'])) {
    const file = path.join(outDir, `${name}.json`)
    const old = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
    const images = (groups.get(name) ?? []).map((img) => mergeStatus(img, old))
    writeFileSync(file, `${JSON.stringify(images, null, 2)}\n`)
  }

  console.log(`\nVùng ${regionId}: ${ids.size} ảnh`)
  const cats = ['natural', 'culture', 'mineral', 'landmark', 'historical_site']
  console.log(['Tỉnh'.padEnd(18), ...cats.map((c) => c.slice(0, 8).padStart(9))].join(''))
  for (const name of [...provinces.map((p) => p.id), '_toan-vung']) {
    const list = groups.get(name) ?? []
    console.log([name.padEnd(18), ...cats.map((c) => String(list.filter((i) => i.category === c).length).padStart(9))].join(''))
  }
  if (skipped.length) {
    console.log(`\nBỏ qua ${skipped.length} ảnh:`)
    for (const [file, where, why] of skipped) console.log(`  - [${where}] ${file}: ${why}`)
  }
}

const [first, ...rest] = process.argv.slice(2)
if (first === '--show') await show(rest)
else if (first) await build(first)
else {
  console.error('Cách dùng: node scripts/commons-fetch.mjs <regionId> | --show "File:..."')
  process.exit(1)
}
