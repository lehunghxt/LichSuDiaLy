import provinces from '../data/provinces.json'

/** Tên các tỉnh của một vùng, theo thứ tự trong dữ liệu */
export const provinceNamesOfRegion = (regionId: string) => provinces.filter((p) => p.regionId === regionId).map((p) => p.name)

/** Tên tỉnh (34 tỉnh, thành phố sau sắp xếp 2025) theo id; undefined nếu không có */
export const provinceName = (id: string | undefined) => provinces.find((p) => p.id === id)?.name
