import { ContentError } from './parse'
import { checkOutlineIntegrity, parseOutline } from './parseOutline'

const R = 'vung-a'
const raw = () => ({
  sections: [
    {
      id: 'thien-nhien',
      topics: [
        { id: 'dia-hinh', title: 'Địa hình', hint: '(núi cao)', itemIds: [`${R}__nui`] },
        { id: 'khi-hau', title: 'Khí hậu', itemIds: [] },
      ],
    },
    { id: 'van-hoa', topics: [{ id: 'cho-phien', title: 'Chợ phiên vùng cao', itemIds: [`${R}__cho`] }] },
  ],
})

test('parses sections and topics in file order', () => {
  const o = parseOutline(raw(), R, 'outline.json')
  expect(o.regionId).toBe(R)
  expect(o.sections.map((s) => s.id)).toEqual(['thien-nhien', 'van-hoa'])
  expect(o.sections[0]!.topics).toEqual([
    { id: 'dia-hinh', title: 'Địa hình', hint: '(núi cao)', itemIds: [`${R}__nui`] },
    { id: 'khi-hau', title: 'Khí hậu', hint: undefined, itemIds: [] },
  ])
})

test('rejects unknown section id', () => {
  const r = raw()
  r.sections[0]!.id = 'natural'
  expect(() => parseOutline(r, R, 'outline.json')).toThrow(ContentError)
})

test('rejects duplicate topic id within a region', () => {
  const r = raw()
  r.sections[1]!.topics[0]!.id = 'dia-hinh'
  expect(() => parseOutline(r, R, 'outline.json')).toThrow(/trùng id mục "dia-hinh"/)
})

test('rejects itemIds with another region prefix', () => {
  const r = raw()
  r.sections[0]!.topics[0]!.itemIds = ['vung-b__nui']
  expect(() => parseOutline(r, R, 'outline.json')).toThrow(/vung-b__nui/)
})

const items = [
  { id: `${R}__nui`, section: 'thien-nhien' as const },
  { id: `${R}__cho`, section: 'van-hoa' as const },
]

test('checkOutlineIntegrity passes a consistent outline', () => {
  expect(checkOutlineIntegrity(parseOutline(raw(), R, 'o'), items)).toEqual([])
})

test('checkOutlineIntegrity reports itemIds that do not exist', () => {
  const r = raw()
  r.sections[0]!.topics[1]!.itemIds = [`${R}__tuyet`]
  expect(checkOutlineIntegrity(parseOutline(r, R, 'o'), items)).toContain(`${R} / khi-hau: không có mục nội dung "${R}__tuyet"`)
})

test('checkOutlineIntegrity reports content items missing from the outline', () => {
  const extra = [...items, { id: `${R}__song`, section: 'thien-nhien' as const }]
  expect(checkOutlineIntegrity(parseOutline(raw(), R, 'o'), extra)).toContain(`${R}: mục nội dung "${R}__song" chưa nằm trong dàn ý`)
})

test("checkOutlineIntegrity reports item whose section differs from its topic's section", () => {
  const wrong = [items[0]!, { id: `${R}__cho`, section: 'thien-nhien' as const }]
  expect(checkOutlineIntegrity(parseOutline(raw(), R, 'o'), wrong)).toContain(
    `${R} / cho-phien: mục "${R}__cho" thuộc phần "thien-nhien" nhưng nằm trong phần "van-hoa"`,
  )
})

test('checkOutlineIntegrity reports an item listed in two topics', () => {
  const r = raw()
  const id = r.sections[0]!.topics[0]!.itemIds[0]!
  r.sections[0]!.topics[1]!.itemIds = [id]
  expect(checkOutlineIntegrity(parseOutline(r, R, 'o'), items)).toContain(`${R} / khi-hau: mục "${id}" đã nằm trong một mục khác`)
})
