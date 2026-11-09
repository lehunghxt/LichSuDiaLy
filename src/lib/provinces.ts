import provinces from '../data/provinces.json'

/** Tên các tỉnh của một vùng, theo thứ tự trong dữ liệu */
export const provinceNamesOfRegion = (regionId: string) => provinces.filter((p) => p.regionId === regionId).map((p) => p.name)

/** Vùng của một tỉnh; id không có thì undefined */
export const provinceRegionId = (id: string) => provinces.find((p) => p.id === id)?.regionId

/** Tên tỉnh (34 tỉnh, thành phố sau sắp xếp 2025) theo id; undefined nếu không có */
export const provinceName = (id: string | undefined) => provinces.find((p) => p.id === id)?.name

/** Các tỉnh cũ hợp nhất thành tỉnh này năm 2025 (Nghị quyết 202/2025/QH15); rỗng nếu tỉnh giữ nguyên */
export const formedFrom = (id: string) => provinces.find((p) => p.id === id)?.formedFrom ?? []

// 6 thành phố trực thuộc trung ương sau năm 2025; 4 thành phố trong số các đơn vị cũ đã hợp nhất
const CITIES = new Set(['ha-noi', 'hue', 'hai-phong', 'da-nang', 'ho-chi-minh', 'can-tho'])
const FORMER_CITIES = new Set(['Hải Phòng', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Cần Thơ'])

/** "Tỉnh Phú Thọ", "Thành phố Đà Nẵng" */
export const provinceTitle = (id: string) => {
  const name = (provinceName(id) ?? id).replace(/^TP\. /, '')
  return CITIES.has(id) ? `Thành phố ${name}` : `Tỉnh ${name}`
}

/** "3 tỉnh" hoặc "2 tỉnh, thành phố" (khi có thành phố cũ trong số các đơn vị hợp nhất) */
export const formerUnits = (id: string) => {
  const former = formedFrom(id)
  return `${former.length} ${former.some((n) => FORMER_CITIES.has(n)) ? 'tỉnh, thành phố' : 'tỉnh'}`
}
