// Nội dung mỗi vùng là một thư mục, mở rộng ra cả nước bằng cách thêm thư mục mới:
//
//   src/data/regions/<regionId>/
//     outline.json                    dàn ý vùng (phần → mục → itemIds), đọc riêng qua repository.loadOutline
//     region.json                     { "intro": "..." }
//     sections/thien-nhien.json       [ mục... ]   Thiên nhiên
//     sections/dan-cu-san-xuat.json   [ mục... ]   Dân cư và hoạt động sản xuất
//     sections/van-hoa.json           [ mục... ]   Văn hóa
//     sections/lich-su.json           [ mục... ]   Lịch sử và di tích
//     quizzes.json                    [ bài ôn tập... ]
//
// Mục trong sections/<phần>.json không cần ghi "section" và "regionId": lấy từ tên file và thư mục.
// File phần hoặc quizzes.json có thể chưa có (coi như rỗng). Vùng chưa có nội dung chỉ có outline.json.
import { SECTIONS } from '../../types/content'
import { ContentError } from './parse'

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)

const sectionFile = (c: string) => `sections/${c}.json`
export const OUTLINE_FILE = 'outline.json'
const KNOWN_FILES = new Set(['region.json', 'quizzes.json', OUTLINE_FILE, ...SECTIONS.map(sectionFile)])

/** Ghép các file của một vùng thành một object thô để parseRegionContent kiểm tra */
export function assembleRegionRaw(region: unknown, files: Record<string, unknown>): unknown {
  const regionId = isObj(region) ? region.id : undefined
  for (const name of Object.keys(files)) {
    if (!KNOWN_FILES.has(name)) throw new ContentError(`${String(regionId)}/${name}`, 'tên file không đúng quy ước')
  }

  const items = SECTIONS.flatMap((section) => {
    const file = sectionFile(section)
    const list = files[file]
    if (list === undefined) return []
    if (!Array.isArray(list)) throw new ContentError(`${String(regionId)}/${file}`, 'cần là mảng')
    return list.map((item: unknown, i) => {
      if (!isObj(item)) return item
      if (item.section !== undefined && item.section !== section) {
        throw new ContentError(`${String(regionId)}/${file}[${i}].section`, `mục nằm trong file "${section}"`)
      }
      return { ...item, section, regionId }
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
    // outline.json nạp riêng (vùng chưa có nội dung vẫn có dàn ý)
    const own = Object.entries(modules).flatMap(([file, load]) => {
      const at = file.indexOf(prefix)
      const name = file.slice(at + prefix.length)
      return at === -1 || name === OUTLINE_FILE ? [] : [[name, load] as const]
    })
    if (own.length === 0) continue
    loaders[region.id] = async () => {
      const loaded = await Promise.all(own.map(async ([name, load]) => [name, moduleDefault(await load())] as const))
      return assembleRegionRaw(region, Object.fromEntries(loaded))
    }
  }
  return loaders
}
