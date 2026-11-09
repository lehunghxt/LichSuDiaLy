import { collectSources } from './collectSources'

const SGK = 'https://taphuan.nxbgd.vn/tap-huan/doc-sach/sgk-lich-su-va-dia-li-4.4756030172'
const item = (id: string, title: string, sources: { title: string; url?: string; page?: number }[]) => ({ id, title, sources })

test('groups items by source title across regions, sorted by lesson number, pages unique and sorted', () => {
  const rows = collectSources([
    {
      regionId: 'a',
      regionName: 'Vùng A',
      items: [
        item('a__x', 'X', [
          {
            title: 'SGK Lịch sử và Địa lý 4 (KNTT), Bài 10. Mười',
            url: SGK,
            page: 47,
          },
        ]),
        item('a__y', 'Y', [
          {
            title: 'SGK Lịch sử và Địa lý 4 (KNTT), Bài 2. Hai',
            url: SGK,
            page: 9,
          },
        ]),
        item('a__z', 'Z', [
          {
            title: 'SGK Lịch sử và Địa lý 4 (KNTT), Bài 10. Mười',
            url: SGK,
            page: 46,
          },
        ]),
      ],
    },
    {
      regionId: 'b',
      regionName: 'Vùng B',
      items: [
        item('b__w', 'W', [
          {
            title: 'SGK Lịch sử và Địa lý 4 (KNTT), Bài 10. Mười',
            url: SGK,
            page: 47,
          },
        ]),
      ],
    },
  ])
  expect(rows.map((r) => r.title)).toEqual(['SGK Lịch sử và Địa lý 4 (KNTT), Bài 2. Hai', 'SGK Lịch sử và Địa lý 4 (KNTT), Bài 10. Mười'])
  const ten = rows[1]!
  expect(ten.pages).toEqual([46, 47])
  expect(ten.regionNames).toEqual(['Vùng A', 'Vùng B'])
  expect(ten.items.map((i) => i.id)).toEqual(['a__x', 'a__z', 'b__w'])
  expect(ten.url).toBe(SGK)
})

test('a source without lesson number sorts after SGK lessons; an item citing it twice is listed once', () => {
  const rows = collectSources([
    {
      regionId: 'a',
      regionName: 'Vùng A',
      items: [
        item('a__x', 'X', [
          { title: 'Tài liệu khác', url: 'https://example.org' },
          { title: 'Tài liệu khác', url: 'https://example.org' },
          {
            title: 'SGK Lịch sử và Địa lý 4 (KNTT), Bài 3. Ba',
            url: SGK,
            page: 12,
          },
        ]),
      ],
    },
  ])
  expect(rows.map((r) => r.title)).toEqual(['SGK Lịch sử và Địa lý 4 (KNTT), Bài 3. Ba', 'Tài liệu khác'])
  expect(rows[1]!.items).toHaveLength(1)
  expect(rows[1]!.pages).toEqual([])
})
