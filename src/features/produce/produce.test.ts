import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ContentError } from '../../lib/validate'
import { parseProduce } from './produce'

const data = (f: string) => JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../../data/produce', f), 'utf8')) as unknown
const crops = data('crops.json')
const images = data('images.json')
const names = (entries: { crop: { name: string } }[]) => entries.map((e) => e.crop.name)

afterEach(() => vi.unstubAllEnvs())

describe('the real data', () => {
  const produce = parseProduce(crops, images)

  test('every crop has its own photo', () => {
    for (const c of produce.crops) expect(c.image.id).toBe(`nong-san__${c.id}`)
  })

  test('a region lists the crops the SGK names, split into industrial and other crops, with the SGK page', () => {
    const nb = produce.forRegion('nam-bo')
    expect(names(nb['cong-nghiep'])).toEqual(['Cao su', 'Điều', 'Hồ tiêu'])
    // SGK xếp dừa vào cây ăn quả của Nam Bộ (tr. 103)
    expect(names(nb['nong-nghiep'])).toEqual(['Lúa', 'Sầu riêng', 'Chôm chôm', 'Xoài', 'Dừa', 'Cam', 'Quýt'])
    expect(nb['cong-nghiep'][0]).toMatchObject({ page: 103, itemId: 'nam-bo__cay-cong-nghiep' })
    expect(names(produce.forRegion('trung-du-mien-nui-phia-bac')['cong-nghiep'])).toEqual(['Chè'])
  })

  test('a province lists its crops with a source for each', () => {
    const lc = produce.forProvince('lai-chau')
    expect(names(lc['cong-nghiep'])).toEqual(['Chè'])
    expect(names(lc['nong-nghiep'])).toEqual(['Lúa', 'Thảo quả', 'Sâm'])
    expect(lc['cong-nghiep'][0]!.source).toEqual({
      title: 'Wikipedia tiếng Việt: Lai Châu',
      url: 'https://vi.wikipedia.org/wiki/Lai_Ch%C3%A2u',
    })
  })

  test('a province without sourced crops has empty groups (nothing is made up)', () => {
    expect(produce.forProvince('ha-noi')).toEqual({ 'cong-nghiep': [], 'nong-nghiep': [] })
  })
})

test('the production build hides draft crops unless drafts are shown', () => {
  vi.stubEnv('PROD', true)
  vi.stubEnv('VITE_SHOW_DRAFTS', 'false')
  const produce = parseProduce(crops, images)
  expect(produce.forProvince('lai-chau')['cong-nghiep']).toEqual([])
  vi.stubEnv('VITE_SHOW_DRAFTS', 'true')
  expect(parseProduce(crops, images).forProvince('lai-chau')['cong-nghiep']).toHaveLength(1)
})

describe('invalid data is rejected with the path of the problem', () => {
  const base = () =>
    JSON.parse(JSON.stringify(crops)) as { crops: Record<string, unknown>[]; provinces: { crops: Record<string, unknown>[] }[] }

  test('a crop kind other than the two groups', () => {
    const d = base()
    d.crops[0]!.kind = 'cay-an-qua'
    expect(() => parseProduce(d, images)).toThrow(ContentError)
  })

  test('a crop without a photo', () => {
    const d = base()
    d.crops.push({ id: 'ca-cao', name: 'Ca cao', kind: 'cong-nghiep' })
    expect(() => parseProduce(d, images)).toThrow(/ca-cao/)
  })

  test('a province crop that is not in the crop list, or has no source', () => {
    const d = base()
    d.provinces[0]!.crops[0]!.crop = 'khong-co'
    expect(() => parseProduce(d, images)).toThrow(/khong-co/)
    const e = base()
    delete e.provinces[0]!.crops[0]!.source
    expect(() => parseProduce(e, images)).toThrow(ContentError)
  })
})
