import provinces from '../data/provinces.json'

/** Tên tỉnh (34 tỉnh, thành phố sau sắp xếp 2025) theo id; undefined nếu không có */
export const provinceName = (id: string | undefined) => provinces.find((p) => p.id === id)?.name
