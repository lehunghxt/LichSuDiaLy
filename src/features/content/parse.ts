// Chuyển JSON (unknown) thành dữ liệu có kiểu. Sai cấu trúc thì ném ContentError
// kèm đường dẫn trường lỗi, ví dụ "items[0].title".
import {
  SECTIONS,
  type ContentItem,
  type ImageRef,
  type ItemLocation,
  type MediaRef,
  type RegionContent,
  type RegionMeta,
  type SgkFigure,
  type SourceRef,
  type SectionId,
} from '../../types/content'
import type { Question, Quiz } from '../../types/quiz'
import { ContentError, join, obj, arr, list, str, optStr, num, strList, oneOf, posInt, STATUSES } from '../../lib/validate'

// Dùng nhiều trong các bộ đọc dữ liệu của content: xuất lại cho gọn
export { ContentError } from '../../lib/validate'

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
  const section: SectionId = oneOf(o, 'section', path, SECTIONS)
  return {
    id: str(o, 'id', path),
    regionId: str(o, 'regionId', path),
    section,
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
