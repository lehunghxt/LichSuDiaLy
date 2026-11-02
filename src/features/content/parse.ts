// Chuyển JSON (unknown) thành dữ liệu có kiểu. Sai cấu trúc thì ném ContentError
// kèm đường dẫn trường lỗi, ví dụ "items[0].title".
import {
  TOPIC_CATEGORIES,
  type ContentItem,
  type ContentStatus,
  type ImageRef,
  type ItemLocation,
  type MediaRef,
  type RegionContent,
  type RegionMeta,
  type SgkFigure,
  type SourceRef,
  type TopicCategory,
} from '../../types/content'
import type { Question, Quiz } from '../../types/quiz'

export class ContentError extends Error {
  readonly path: string
  constructor(path: string, message: string) {
    super(`${path || '(gốc)'}: ${message}`)
    this.name = 'ContentError'
    this.path = path
  }
}

type Obj = Record<string, unknown>

const join = (path: string, key: string) => (path ? `${path}.${key}` : key)

function obj(v: unknown, path: string): Obj {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ContentError(path, 'cần là object')
  return Object.fromEntries(Object.entries(v))
}

function arr(v: unknown, path: string): unknown[] {
  if (!Array.isArray(v)) throw new ContentError(path, 'cần là mảng')
  return v
}

function list<T>(o: Obj, key: string, path: string, parseOne: (v: unknown, p: string) => T): T[] {
  const p = join(path, key)
  return arr(o[key], p).map((v, i) => parseOne(v, `${p}[${i}]`))
}

function str(o: Obj, key: string, path: string): string {
  const v = o[key]
  if (typeof v !== 'string' || v.trim() === '') throw new ContentError(join(path, key), 'cần là chuỗi không rỗng')
  return v
}

function optStr(o: Obj, key: string, path: string): string | undefined {
  return o[key] === undefined ? undefined : str(o, key, path)
}

function num(o: Obj, key: string, path: string): number {
  const v = o[key]
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new ContentError(join(path, key), 'cần là số')
  return v
}

function strList(o: Obj, key: string, path: string): string[] {
  return list(o, key, path, (v, p) => {
    if (typeof v !== 'string' || v.trim() === '') throw new ContentError(p, 'cần là chuỗi không rỗng')
    return v
  })
}

function oneOf<T extends string>(o: Obj, key: string, path: string, allowed: readonly T[]): T {
  const v = o[key]
  const found = allowed.find((a) => a === v)
  if (found === undefined) throw new ContentError(join(path, key), `cần là một trong: ${allowed.join(', ')}`)
  return found
}

function posInt(o: Obj, key: string, path: string): number {
  const v = num(o, key, path)
  if (!Number.isInteger(v) || v < 1) throw new ContentError(join(path, key), 'cần là số nguyên dương')
  return v
}

const STATUSES: readonly ContentStatus[] = ['draft', 'verified']

function parseSource(v: unknown, path: string): SourceRef {
  const o = obj(v, path)
  return {
    title: str(o, 'title', path),
    url: optStr(o, 'url', path),
    note: optStr(o, 'note', path),
    page: o.page === undefined ? undefined : posInt(o, 'page', path),
  }
}

function parseFigure(v: unknown, path: string): SgkFigure {
  const o = obj(v, path)
  return {
    lesson: posInt(o, 'lesson', path),
    figure: posInt(o, 'figure', path),
    page: posInt(o, 'page', path),
    caption: str(o, 'caption', path),
  }
}

function parseImage(v: unknown, path: string): ImageRef {
  const o = obj(v, path)
  return {
    imageId: str(o, 'imageId', path),
    alt: str(o, 'alt', path),
    credit: str(o, 'credit', path),
    license: str(o, 'license', path),
    sourceUrl: optStr(o, 'sourceUrl', path),
  }
}

function parseMedia(v: unknown, path: string): MediaRef {
  const o = obj(v, path)
  return { src: str(o, 'src', path), credit: str(o, 'credit', path), license: str(o, 'license', path) }
}

function parseLocation(v: unknown, path: string): ItemLocation {
  const o = obj(v, path)
  return { lat: num(o, 'lat', path), lng: num(o, 'lng', path), placeName: str(o, 'placeName', path) }
}

function parseRegionMeta(v: unknown, path: string): RegionMeta {
  const o = obj(v, path)
  return {
    id: str(o, 'id', path),
    name: str(o, 'name', path),
    shortName: str(o, 'shortName', path),
    color: str(o, 'color', path),
    status: oneOf(o, 'status', path, ['active', 'coming_soon'] as const),
  }
}

function parseItem(v: unknown, path: string): ContentItem {
  const o = obj(v, path)
  const category: TopicCategory = oneOf(o, 'category', path, TOPIC_CATEGORIES)
  return {
    id: str(o, 'id', path),
    regionId: str(o, 'regionId', path),
    category,
    title: str(o, 'title', path),
    summary: str(o, 'summary', path),
    highlights: strList(o, 'highlights', path),
    keyPoints: strList(o, 'keyPoints', path),
    funFacts: o.funFacts === undefined ? undefined : strList(o, 'funFacts', path),
    location: o.location === undefined ? undefined : parseLocation(o.location, join(path, 'location')),
    provinceId: optStr(o, 'provinceId', path),
    images: list(o, 'images', path, parseImage),
    figures: o.figures === undefined ? undefined : list(o, 'figures', path, parseFigure),
    audio: o.audio === undefined ? undefined : parseMedia(o.audio, join(path, 'audio')),
    relatedIds: strList(o, 'relatedIds', path),
    sources: list(o, 'sources', path, parseSource),
    status: oneOf(o, 'status', path, STATUSES),
  }
}

function parseQuestion(v: unknown, path: string): Question {
  const o = obj(v, path)
  const base = {
    id: str(o, 'id', path),
    prompt: str(o, 'prompt', path),
    explanation: str(o, 'explanation', path),
    sources: list(o, 'sources', path, parseSource),
    status: oneOf(o, 'status', path, STATUSES),
  }
  const type = oneOf(o, 'type', path, ['single_choice', 'true_false', 'map_locate', 'matching'] as const)
  switch (type) {
    case 'single_choice': {
      const [a, b, c, d, ...extra] = strList(o, 'options', path)
      if (a === undefined || b === undefined || c === undefined || d === undefined || extra.length > 0) {
        throw new ContentError(join(path, 'options'), 'cần đúng 4 đáp án')
      }
      const answerIndex = ([0, 1, 2, 3] as const).find((i) => i === o.answerIndex)
      if (answerIndex === undefined) throw new ContentError(join(path, 'answerIndex'), 'cần là 0, 1, 2 hoặc 3')
      return { ...base, type, options: [a, b, c, d], answerIndex }
    }
    case 'true_false': {
      if (typeof o.answer !== 'boolean') throw new ContentError(join(path, 'answer'), 'cần là true/false')
      return { ...base, type, answer: o.answer }
    }
    case 'map_locate': {
      const targetItemId = str(o, 'targetItemId', path)
      const candidateItemIds = strList(o, 'candidateItemIds', path)
      if (!candidateItemIds.includes(targetItemId)) {
        throw new ContentError(join(path, 'candidateItemIds'), 'phải chứa targetItemId')
      }
      return { ...base, type, targetItemId, candidateItemIds }
    }
    case 'matching': {
      const pairs = list(o, 'pairs', path, (p, pp) => {
        const po = obj(p, pp)
        return { left: str(po, 'left', pp), right: str(po, 'right', pp) }
      })
      if (pairs.length < 2) throw new ContentError(join(path, 'pairs'), 'cần ít nhất 2 cặp')
      return { ...base, type, pairs }
    }
  }
}

function parseQuiz(v: unknown, path: string): Quiz {
  const o = obj(v, path)
  return {
    id: str(o, 'id', path),
    regionId: str(o, 'regionId', path),
    title: str(o, 'title', path),
    questions: list(o, 'questions', path, parseQuestion),
  }
}

export function parseRegionList(raw: unknown): RegionMeta[] {
  return arr(raw, '').map((v, i) => parseRegionMeta(v, `[${i}]`))
}

export function parseRegionContent(raw: unknown): RegionContent {
  const o = obj(raw, '')
  return {
    region: parseRegionMeta(o.region, 'region'),
    intro: str(o, 'intro', ''),
    items: list(o, 'items', '', parseItem),
    quizzes: list(o, 'quizzes', '', parseQuiz),
  }
}
