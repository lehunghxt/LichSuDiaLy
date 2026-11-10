import { globSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { ContentError } from '../../../../src/lib/validate'
import { parseFestivalVideos } from '../../../../src/features/videos/festivalVideos'

const raw = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../../../../src/data/festival-videos.json'), 'utf8')) as Record<
  string,
  unknown
>[]
const provinces = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../../../../src/data/provinces.json'), 'utf8')) as { id: string }[]

afterEach(() => vi.unstubAllEnvs())

describe('the real data', () => {
  const videos = parseFestivalVideos(raw)

  test('every province has at least one festival video', () => {
    for (const p of provinces) expect(videos.forProvince(p.id).length, p.id).toBeGreaterThan(0)
  })

  test('a video names its festival and credits the YouTube channel', () => {
    expect(videos.forProvince('quang-ngai')[0]).toMatchObject({
      festival: 'Lễ Khao lề thế lính Hoàng Sa',
      video: { provider: 'youtube', id: 'P5yh-S1ffMg', channel: 'VTV24', channelUrl: 'https://www.youtube.com/@vtv24' },
    })
    expect(videos.forProvince('khanh-hoa').map((v) => v.festival)).toEqual(['Lễ hội Tháp Bà Pô Nagar', 'Lễ hội Ka-tê'])
  })

  test('a linked content item exists', () => {
    const ids = new Set(
      globSync('src/data/regions/*/sections/*.json').flatMap((f) =>
        (JSON.parse(readFileSync(f, 'utf8')) as { id: string }[]).map((i) => i.id),
      ),
    )
    for (const v of videos.all) if (v.itemId) expect(ids.has(v.itemId), v.itemId).toBe(true)
  })
})

test('the production build hides draft videos', () => {
  // Dữ liệu thật đã duyệt hết: đặt lại một bản sao về nháp
  const drafts = JSON.parse(JSON.stringify(raw).replaceAll('"verified"', '"draft"')) as typeof raw
  vi.stubEnv('PROD', true)
  expect(parseFestivalVideos(drafts).forProvince('quang-ngai')).toEqual([])
})

describe('invalid data is rejected', () => {
  const one = (video: Record<string, unknown>) => [{ ...raw[0], video: { ...(raw[0]!.video as object), ...video } }]

  test('a video id that is not a YouTube id', () => {
    expect(() => parseFestivalVideos(one({ id: 'abc' }))).toThrow(ContentError)
  })

  test('a channel link outside YouTube', () => {
    expect(() => parseFestivalVideos(one({ channelUrl: 'https://example.com/x' }))).toThrow(/channelUrl/)
  })

  test('a video without its channel name', () => {
    expect(() => parseFestivalVideos(one({ channel: '' }))).toThrow(ContentError)
  })
})
