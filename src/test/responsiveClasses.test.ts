// Quy tắc bố cục theo thiết bị (docs/superpowers/specs/2026-11-07-device-layouts-design.md):
// lớp responsive của Tailwind (sm:, md:, lg:, xl:, 2xl:) chỉ được dùng trong file bố cục của từng thiết bị.
// Component dùng chung nhận prop để đổi kiểu hiển thị; sửa giao diện một thiết bị không lan sang thiết bị khác.
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(import.meta.dirname, '..')
// Container query (@md:, @lg:…) được phép: component đổi theo khung chứa nó, không theo thiết bị
const RESPONSIVE = /(?<![\w/:@-])(?:sm|md|lg|xl|2xl):[\w[-]/

/** File bố cục: <Thiết bị>Xxx.tsx hoặc XxxLayout.tsx */
const isLayoutFile = (file: string) => /^(Mobile|Tablet|Desktop)[A-Z]\w*\.tsx$|Layout\.tsx$/.test(path.basename(file))

// File chưa tách theo thiết bị (tạm cho phép). Hiện không còn file nào; danh sách này chỉ được rút ngắn.
const PENDING = new Set<string>([])

function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return tsxFiles(p)
    return e.name.endsWith('.tsx') && !e.name.includes('.test.') ? [p] : []
  })
}

const offenders = tsxFiles(SRC)
  .filter((f) => !isLayoutFile(f) && RESPONSIVE.test(readFileSync(f, 'utf8')))
  .map((f) => path.relative(SRC, f).split(path.sep).join('/'))

test('responsive classes only appear in per-device layout files', () => {
  expect(offenders.filter((f) => !PENDING.has(f))).toEqual([])
})

test('the pending list only names files that still need splitting (remove a file once it is done)', () => {
  expect([...PENDING].filter((f) => !offenders.includes(f))).toEqual([])
})
