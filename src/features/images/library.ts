// Thư viện ảnh nhúng, mỗi vùng một thư mục:
//
//   src/data/images/<regionId>/<provinceId>.json   ảnh của một tỉnh
//   src/data/images/<regionId>/_toan-vung.json     ảnh của cả vùng
//
// Tên file quyết định provinceId, thư mục quyết định regionId. Sinh bằng `npm run images:fetch <regionId>`.
import provinces from '../../data/provinces.json'
import type { RegionContent, WebImage } from '../../types/content'
import { isPublished } from '../content/repository'
import { parseWebImages } from './parseWebImages'

type Loader = () => Promise<unknown>

export const REGION_WIDE_FILE = '_toan-vung'

export interface ImageLibrary {
  /** Ảnh của một vùng (đã lọc ảnh nháp ở bản chính thức), theo thứ tự tỉnh, ảnh chung của vùng cuối cùng */
  loadRegion(regionId: string): Promise<WebImage[]>
  loadAll(): Promise<WebImage[]>
  forItem(images: WebImage[], itemId: string): WebImage[]
  forProvince(images: WebImage[], provinceId: string): WebImage[]
  /** Ảnh bìa: danh lam thắng cảnh đầu tiên, rồi đến đặc điểm tự nhiên */
  regionCover(images: WebImage[]): WebImage | undefined
}

const FILE_PATTERN = /\/images\/([^/]+)\/([^/]+)\.json$/
const moduleDefault = (mod: unknown) => (typeof mod === 'object' && mod !== null && 'default' in mod ? mod.default : mod)
const order = (provinceId: string | null) => (provinceId === null ? Infinity : provinces.findIndex((p) => p.id === provinceId))

export function createImageLibrary(modules: Record<string, Loader>): ImageLibrary {
  const files = Object.entries(modules).flatMap(([file, load]) => {
    const m = FILE_PATTERN.exec(file)
    return m?.[1] && m[2] ? [{ regionId: m[1], name: m[2], load, path: `images/${m[1]}/${m[2]}.json` }] : []
  })
  const cache = new Map<string, Promise<WebImage[]>>()

  const loadRegion = (regionId: string) => {
    let pending = cache.get(regionId)
    if (!pending) {
      pending = Promise.all(
        files
          .filter((f) => f.regionId === regionId)
          .map(async (f) => parseWebImages(moduleDefault(await f.load()), regionId, f.name === REGION_WIDE_FILE ? null : f.name, f.path)),
      ).then((lists) => lists.flat().sort((a, b) => order(a.provinceId) - order(b.provinceId)))
      pending.catch(() => cache.delete(regionId))
      cache.set(regionId, pending)
    }
    return pending.then((images) => images.filter((i) => isPublished(i.status)))
  }

  return {
    loadRegion,
    loadAll: async () => (await Promise.all([...new Set(files.map((f) => f.regionId))].map(loadRegion))).flat(),
    forItem: (images, itemId) => images.filter((i) => i.itemIds.includes(itemId)),
    forProvince: (images, provinceId) => images.filter((i) => i.provinceId === provinceId),
    // Ưu tiên danh thắng có trong bài học (SGK), rồi danh thắng bất kì, rồi ảnh tự nhiên
    regionCover: (images) =>
      images.find((i) => i.category === 'landmark' && i.itemIds.length > 0) ??
      images.find((i) => i.category === 'landmark') ??
      images.find((i) => i.category === 'natural'),
  }
}

/** Lấy lần lượt mỗi tỉnh một ảnh (giữ thứ tự trong từng tỉnh) để thư viện ảnh vùng không bị một tỉnh chiếm hết */
export function interleaveByProvince(images: WebImage[]): WebImage[] {
  const groups = new Map<string | null, WebImage[]>()
  for (const img of images) groups.set(img.provinceId, [...(groups.get(img.provinceId) ?? []), img])
  const out: WebImage[] = []
  for (let round = 0; out.length < images.length; round++) {
    for (const group of groups.values()) {
      const img = group[round]
      if (img) out.push(img)
    }
  }
  return out
}

export const imageLibrary = createImageLibrary(import.meta.glob('../../data/images/**/*.json'))

/** Kiểm tra tham chiếu giữa thư viện ảnh, danh sách tỉnh và nội dung. Rỗng nghĩa là hợp lệ */
export function checkImageIntegrity(
  images: WebImage[],
  contents: RegionContent[],
  provinceList: { id: string; regionId: string }[],
): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  for (const img of images) {
    if (seen.has(img.id)) problems.push(`ảnh: trùng id "${img.id}"`)
    seen.add(img.id)
    if (img.provinceId !== null) {
      const p = provinceList.find((x) => x.id === img.provinceId)
      if (!p) problems.push(`${img.id}: không có tỉnh "${img.provinceId}"`)
      else if (p.regionId !== img.regionId) problems.push(`${img.id}: tỉnh "${img.provinceId}" không thuộc vùng "${img.regionId}"`)
    }
    const content = contents.find((c) => c.region.id === img.regionId)
    for (const itemId of img.itemIds) {
      if (!content) problems.push(`${img.id}.itemIds: vùng "${img.regionId}" chưa có nội dung nên không gắn được "${itemId}"`)
      else if (!content.items.some((i) => i.id === itemId)) problems.push(`${img.id}.itemIds: không có mục "${itemId}"`)
    }
  }
  return problems
}
