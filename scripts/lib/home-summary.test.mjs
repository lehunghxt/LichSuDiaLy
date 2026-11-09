import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { buildHomeSummary, summarySourceFiles } from './home-summary.mjs'

let dir
const write = (rel, value) => {
  const file = path.join(dir, rel)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value))
}
const item = (id, status, extra = {}) => ({ id, title: `Tên ${id}`, status, ...extra })

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'summary-'))
  write('regions.json', [{ id: 'a' }, { id: 'b' }])
  write('regions/a/region.json', { intro: '…' })
  write('regions/a/sections/thien-nhien.json', [item('a__1', 'verified', { funFacts: ['F1'] }), item('a__2', 'draft', { funFacts: ['F2'] })])
  write('regions/a/quizzes.json', [{ id: 'a__q', questions: [{ status: 'verified' }, { status: 'draft' }] }])
  write('regions/a/outline.json', {
    sections: [{ id: 'thien-nhien', topics: [{ id: 't1', itemIds: ['a__1'] }, { id: 't2', itemIds: ['a__2'] }] }],
  })
  // Vùng chỉ có dàn ý: chưa có nội dung, không vào số liệu
  write('regions/b/outline.json', { sections: [] })
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

test('only published items and questions are counted; a topic is filled only by a published item', () => {
  const { regions } = buildHomeSummary(dir, (s) => s === 'verified')
  expect(regions).toEqual([
    {
      id: 'a',
      items: [{ id: 'a__1', title: 'Tên a__1' }],
      questions: 1,
      funFacts: [{ fact: 'F1', itemId: 'a__1' }],
      sections: [{ id: 'thien-nhien', topics: 2, filled: 1 }],
    },
  ])
})

test('showing drafts counts everything', () => {
  const [a] = buildHomeSummary(dir, () => true).regions
  expect(a.items).toHaveLength(2)
  expect(a.questions).toBe(2)
  expect(a.sections[0].filled).toBe(2)
})

test('every source file is watched', () => {
  const files = summarySourceFiles(dir).map((f) => path.relative(dir, f).split(path.sep).join('/'))
  expect(files.sort()).toEqual(
    ['regions.json', 'regions/a/outline.json', 'regions/a/quizzes.json', 'regions/a/region.json', 'regions/a/sections/thien-nhien.json', 'regions/b/outline.json'].sort(),
  )
})
