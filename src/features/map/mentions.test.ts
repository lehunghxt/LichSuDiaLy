import type { ContentItem } from '../../types/content'
import { provinceMentions } from './mentions'

const item = (id: string, over: Partial<ContentItem>): ContentItem =>
  ({
    id,
    regionId: 'r',
    section: 'kinh-te',
    title: id,
    summary: '',
    highlights: [],
    keyPoints: [],
    images: [],
    relatedIds: [],
    sources: [],
    status: 'draft',
    ...over,
  }) as ContentItem

const items = [
  item('r__lam-muoi', {
    summary: 'Nghề làm muối phát triển ven biển.',
    keyPoints: ['Nơi làm muối nổi tiếng có Sa Huỳnh (Quảng Ngãi), Cà Ná (Khánh Hoà),…'],
  }),
  item('r__bai-bien', { highlights: ['Một số bãi biển nổi tiếng: Sầm Sơn (Thanh Hoá), Nha Trang (Khánh Hoà).', 'Biển đẹp quanh năm.'] }),
  item('r__nha-trang', { provinceId: 'khanh-hoa', summary: 'Vịnh Nha Trang thuộc Khánh Hoà.' }),
  item('r__bac-ho', { summary: 'Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập.' }),
  item('r__tphcm', { summary: 'Thành phố Hồ Chí Minh là thành phố lớn nhất cả nước.' }),
]

test('provinceMentions: SGK sentences naming the province, with the item they come from; old and new tone placement both match', () => {
  expect(provinceMentions(items, 'khanh-hoa')).toEqual([
    { item: items[0], sentences: ['Nơi làm muối nổi tiếng có Sa Huỳnh (Quảng Ngãi), Cà Ná (Khánh Hoà),…'] },
    { item: items[1], sentences: ['Một số bãi biển nổi tiếng: Sầm Sơn (Thanh Hoá), Nha Trang (Khánh Hoà).'] },
  ])
})

test('provinceMentions: items already tied to the province are left out (the card lists them separately)', () => {
  expect(provinceMentions(items, 'khanh-hoa').map((m) => m.item.id)).not.toContain('r__nha-trang')
})

test('provinceMentions: Hồ Chí Minh the city, not the person', () => {
  expect(provinceMentions(items, 'ho-chi-minh').map((m) => m.item.id)).toEqual(['r__tphcm'])
})

test('provinceMentions: no match or unknown province → empty', () => {
  expect(provinceMentions(items, 'ca-mau')).toEqual([])
  expect(provinceMentions(items, 'khong-co')).toEqual([])
})

test('provinceMentions: places the lessons name without their province still count (Thành nhà Hồ → Thanh Hoá, Lâm Viên/Di Linh/Bình Thuận → Lâm Đồng)', () => {
  const places = [
    item('r__di-san', { summary: 'Vùng có nhiều di sản như: Thành nhà Hồ, Phố cổ Hội An.' }),
    item('r__dia-hinh', { keyPoints: ['Các cao nguyên Lâm Viên, Di Linh (cao khoảng 1 000–1 500 m).'] }),
    item('r__ka-te', { funFacts: ['Lễ hội Ka-tê của người Chăm ở Bình Thuận được công nhận năm 2022.'] }),
  ]
  expect(provinceMentions(places, 'thanh-hoa').map((m) => m.item.id)).toEqual(['r__di-san'])
  expect(provinceMentions(places, 'lam-dong').map((m) => m.item.id)).toEqual(['r__dia-hinh', 'r__ka-te'])
})
