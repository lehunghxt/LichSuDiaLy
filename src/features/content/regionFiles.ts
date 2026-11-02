// Nội dung mỗi vùng là một thư mục, mở rộng ra cả nước bằng cách thêm thư mục mới:
//
//   src/data/regions/<regionId>/
//     region.json              { "intro": "..." }
//     topics/natural.json      [ mục... ]   Đặc điểm tự nhiên
//     topics/culture.json      [ mục... ]   Lễ hội và văn hóa
//     topics/mineral.json      [ mục... ]   Khoáng sản
//     topics/landmark.json     [ mục... ]   Danh lam thắng cảnh
//     topics/historical_site.json           Di tích lịch sử
//     quizzes.json             [ bài ôn tập... ]
//
// Mục trong topics/<chủ đề>.json không cần ghi "category" và "regionId": lấy từ tên file và thư mục.
// File chủ đề hoặc quizzes.json có thể chưa có (coi như rỗng).
import { TOPIC_CATEGORIES } from '../../types/content'
import { ContentError } from './parse'

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

const topicFile = (c: string) => `topics/${c}.json`
const KNOWN_FILES = new Set(['region.json', 'quizzes.json', ...TOPIC_CATEGORIES.map(topicFile)])

/** Ghép các file của một vùng thành một object thô để parseRegionContent kiểm tra */
export function assembleRegionRaw(region: unknown, files: Record<string, unknown>): unknown {
  const regionId = isObj(region) ? region.id : undefined
  for (const name of Object.keys(files)) {
    if (!KNOWN_FILES.has(name)) throw new ContentError(`${String(regionId)}/${name}`, 'tên file không đúng quy ước')
  }

  const items = TOPIC_CATEGORIES.flatMap((category) => {
    const file = topicFile(category)
    const list = files[file]
    if (list === undefined) return []
    if (!Array.isArray(list)) throw new ContentError(`${String(regionId)}/${file}`, 'cần là mảng')
    return list.map((item: unknown, i) => {
      if (!isObj(item)) return item
      if (item.category !== undefined && item.category !== category) {
        throw new ContentError(`${String(regionId)}/${file}[${i}].category`, `mục nằm trong file "${category}"`)
      }
      return { ...item, category, regionId }
    })
  })

  const meta = files['region.json']
  return {
    region,
    intro: isObj(meta) ? meta.intro : undefined,
    items,
    quizzes: files['quizzes.json'] ?? [],
  }
}

type Loader = () => Promise<unknown>

const moduleDefault = (mod: unknown) => (isObj(mod) && 'default' in mod ? mod.default : mod)

/**
 * Từ kết quả import.meta.glob('../../data/regions/** /*.json') tạo hàm nạp cho từng vùng
 * khai báo trong regions.json. Mỗi vùng là một chunk riêng, chỉ tải khi mở vùng đó.
 */
export function loadersFromGlob(regions: unknown[], modules: Record<string, Loader>): Record<string, Loader> {
  const loaders: Record<string, Loader> = {}
  for (const region of regions) {
    if (!isObj(region) || typeof region.id !== 'string') continue
    const prefix = `/regions/${region.id}/`
    const own = Object.entries(modules).flatMap(([file, load]) => {
      const at = file.indexOf(prefix)
      return at === -1 ? [] : [[file.slice(at + prefix.length), load] as const]
    })
    if (own.length === 0) continue
    loaders[region.id] = async () => {
      const loaded = await Promise.all(own.map(async ([name, load]) => [name, moduleDefault(await load())] as const))
      return assembleRegionRaw(region, Object.fromEntries(loaded))
    }
  }
  return loaders
}
