import { rawRegionContent } from '../../../support/fixtures'
import { ContentError, parseRegionContent, parseRegionList } from '../../../../src/features/content/parse'

function expectContentError(fn: () => unknown, path: string) {
  try {
    fn()
  } catch (e) {
    expect(e).toBeInstanceOf(ContentError)
    if (e instanceof ContentError) expect(e.path).toBe(path)
    return
  }
  throw new Error('expected ContentError')
}

test('parses valid region content', () => {
  const content = parseRegionContent(rawRegionContent())
  expect(content.region.name).toBe('Vùng A')
  expect(content.items).toHaveLength(2)
  expect(content.items[0]?.location?.placeName).toBe('Tỉnh X')
  expect(content.quizzes[0]?.questions[0]?.type).toBe('single_choice')
})

test('parseRegionContent throws ContentError with path on missing title', () => {
  const raw = rawRegionContent()
  Reflect.deleteProperty(raw.items[0]!, 'title')
  expectContentError(() => parseRegionContent(raw), 'items[0].title')
})

test('rejects single_choice without exactly 4 options', () => {
  const raw = rawRegionContent()
  const q = raw.quizzes[0]!.questions[0]!
  raw.quizzes[0]!.questions[0] = { ...q, options: ['A', 'B', 'C'] }
  expectContentError(() => parseRegionContent(raw), 'quizzes[0].questions[0].options')
})

test('rejects answerIndex outside 0..3', () => {
  const raw = rawRegionContent()
  raw.quizzes[0]!.questions[0] = { ...raw.quizzes[0]!.questions[0]!, answerIndex: 4 }
  expectContentError(() => parseRegionContent(raw), 'quizzes[0].questions[0].answerIndex')
})

test('rejects unknown section', () => {
  const raw = rawRegionContent()
  raw.items[1] = { ...raw.items[1]!, section: 'food' }
  expectContentError(() => parseRegionContent(raw), 'items[1].section')
})

test('rejects unknown question type', () => {
  const raw = rawRegionContent()
  raw.quizzes[0]!.questions[1] = { ...raw.quizzes[0]!.questions[1]!, type: 'essay' }
  expectContentError(() => parseRegionContent(raw), 'quizzes[0].questions[1].type')
})

test('rejects non-object input', () => {
  expectContentError(() => parseRegionContent(null), '')
})

test('parseRegionList parses array and rejects bad status', () => {
  const region = rawRegionContent().region
  expect(parseRegionList([region])).toHaveLength(1)
  expectContentError(() => parseRegionList([{ ...region, status: 'hidden' }]), '[0].status')
})

test('parses SGK figures and source page numbers', () => {
  const raw = rawRegionContent()
  raw.items[0] = {
    ...raw.items[0],
    figures: [{ lesson: 4, figure: 2, page: 19, caption: 'Lược đồ địa hình' }],
    sources: [{ title: 'SGK', page: 19 }],
  }
  const item = parseRegionContent(raw).items[0]
  expect(item?.figures).toEqual([{ lesson: 4, figure: 2, page: 19, caption: 'Lược đồ địa hình' }])
  expect(item?.sources[0]?.page).toBe(19)
})

test('figure page must be a positive integer', () => {
  const raw = rawRegionContent()
  raw.items[0] = { ...raw.items[0], figures: [{ lesson: 4, figure: 2, page: 0, caption: 'x' }] }
  expectContentError(() => parseRegionContent(raw), 'items[0].figures[0].page')
})
