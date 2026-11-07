// Thứ tự lớp chồng đặt tên một lần trong src/styles/index.css (@utility z-…), không viết số z-[…] rải rác:
// thêm lớp mới thì chọn tên đúng chỗ, không đoán số và đè sai (ảnh phóng to phải nằm trên khung xem bài…)
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(import.meta.dirname, '..')
const css = readFileSync(path.join(SRC, 'styles/index.css'), 'utf8')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return sourceFiles(p)
    return /\.tsx?$/.test(e.name) && !e.name.includes('.test.') ? [p] : []
  })
}
const sources = sourceFiles(SRC).map((f) => ({ file: path.relative(SRC, f), text: readFileSync(f, 'utf8') }))

/** Các lớp đã khai báo: tên → z-index */
const layers = new Map([...css.matchAll(/@utility z-([a-z-]+) \{\s*z-index: (\d+);/g)].map((m) => [m[1]!, Number(m[2])]))

test('no hard-coded z-index numbers above the map (z-[1000] and up)', () => {
  expect(sources.filter((s) => /z-\[\d{4}\]/.test(s.text)).map((s) => s.file)).toEqual([])
})

test('every named layer used in the code is declared in index.css', () => {
  const used = new Set(sources.flatMap((s) => [...s.text.matchAll(/(?<![\w-])z-([a-z][a-z-]*)(?![\w-])/g)].map((m) => m[1]!)))
  expect([...used].filter((name) => !layers.has(name))).toEqual([])
})

test('layers stack in this order: map controls < header and panels < tab bar < dialogs < image viewer', () => {
  const order = ['map-ui', 'overlay', 'nav', 'dialog', 'viewer'].map((n) => layers.get(n))
  expect(order.every((z) => z !== undefined)).toBe(true)
  expect(order).toEqual([...(order as number[])].sort((a, b) => a - b))
  // Leaflet đặt nút điều khiển của nó ở z-index 1000: các lớp của app không được thấp hơn
  expect(layers.get('map-ui')).toBeGreaterThanOrEqual(1000)
})
