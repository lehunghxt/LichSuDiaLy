import provinces from '../data/provinces.json'
import { formedFrom, formerUnits, provinceTitle } from './provinces'

test('2025 reorganisation: 23 provinces formed from 63 former ones, 11 unchanged (Nghị quyết 202/2025/QH15)', () => {
  const merged = provinces.filter((p) => formedFrom(p.id).length > 0)
  expect(merged).toHaveLength(23)
  expect(
    provinces
      .filter((p) => formedFrom(p.id).length === 0)
      .map((p) => p.id)
      .sort(),
  ).toEqual(
    ['cao-bang', 'dien-bien', 'ha-noi', 'ha-tinh', 'hue', 'lai-chau', 'lang-son', 'nghe-an', 'quang-ninh', 'son-la', 'thanh-hoa'].sort(),
  )
  const former = merged.flatMap((p) => formedFrom(p.id))
  expect(new Set(former).size).toBe(former.length)
  expect(former.length + 11).toBe(63)
})

test('formedFrom lists the former provinces, including the one whose name was kept', () => {
  expect(formedFrom('lam-dong')).toEqual(['Lâm Đồng', 'Đắk Nông', 'Bình Thuận'])
  expect(formedFrom('ho-chi-minh')).toEqual(['TP. Hồ Chí Minh', 'Bình Dương', 'Bà Rịa – Vũng Tàu'])
  expect(formedFrom('thanh-hoa')).toEqual([])
  expect(formedFrom('khong-co')).toEqual([])
})

test('provinceTitle: the 6 centrally-run cities are "Thành phố", the rest "Tỉnh"', () => {
  expect(provinceTitle('phu-tho')).toBe('Tỉnh Phú Thọ')
  expect(provinceTitle('da-nang')).toBe('Thành phố Đà Nẵng')
  expect(provinceTitle('ho-chi-minh')).toBe('Thành phố Hồ Chí Minh')
  expect(provinceTitle('hue')).toBe('Thành phố Huế')
})

test('formerUnits: "tỉnh" when all were provinces, "tỉnh, thành phố" when a former city is among them', () => {
  expect(formerUnits('phu-tho')).toBe('3 tỉnh')
  expect(formerUnits('da-nang')).toBe('2 tỉnh, thành phố')
})
