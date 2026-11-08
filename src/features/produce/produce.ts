// Cây trồng tiêu biểu của vùng (theo SGK, có số trang) và của tỉnh (ngoài SGK, nháp, ghi nguồn từng cây).
// Dữ liệu: src/data/produce/crops.json; ảnh: src/data/produce/images.json (sinh bằng commons-fetch --produce).
import { isPublished } from '../../lib/publishing'
import { ContentError, STATUSES, list, obj, oneOf, posInt, str, type Obj } from '../../lib/validate'
import type { ContentStatus, WebImage } from '../../types/content'
import { parseWebImages } from '../images'

export const CROP_KINDS = ['cong-nghiep', 'nong-nghiep'] as const
export type CropKind = (typeof CROP_KINDS)[number]

export const CROP_KIND_LABELS: Record<CropKind, string> = {
  'cong-nghiep': 'Cây công nghiệp',
  'nong-nghiep': 'Cây nông nghiệp',
}

export interface Crop {
  id: string
  name: string
  kind: CropKind
  image: WebImage
}

export interface CropEntry {
  crop: Crop
  /** Cây của vùng: trang SGK và mục nội dung nêu cây đó */
  page?: number
  itemId?: string
  /** Cây của tỉnh (ngoài SGK): nguồn ghi nhận */
  source?: { title: string; url: string }
}

export type CropGroups = Record<CropKind, CropEntry[]>

export interface Produce {
  crops: Crop[]
  forRegion(regionId: string): CropGroups
  forProvince(provinceId: string): CropGroups
}

interface Owner {
  id: string
  status: ContentStatus
  entries: CropEntry[]
}

function group(entries: CropEntry[]): CropGroups {
  return {
    'cong-nghiep': entries.filter((e) => e.crop.kind === 'cong-nghiep'),
    'nong-nghiep': entries.filter((e) => e.crop.kind === 'nong-nghiep'),
  }
}

function cropRef(o: Obj, path: string, byId: Map<string, Crop>): Crop {
  const id = str(o, 'crop', path)
  const crop = byId.get(id)
  if (!crop) throw new ContentError(`${path}.crop`, `không có cây "${id}" trong danh sách crops`)
  return crop
}

export function parseProduce(rawCrops: unknown, rawImages: unknown): Produce {
  const images = new Map(parseWebImages(rawImages, 'nong-san', null, 'produce/images.json').map((i) => [i.id, i]))
  const root = obj(rawCrops, 'produce/crops.json')

  const crops = list(root, 'crops', 'crops', (v, p) => {
    const o = obj(v, p)
    const id = str(o, 'id', p)
    const image = images.get(`nong-san__${id}`)
    if (!image) throw new ContentError(p, `cây "${id}" chưa có ảnh nong-san__${id} trong images.json`)
    return { id, name: str(o, 'name', p), kind: oneOf(o, 'kind', p, CROP_KINDS), image }
  })
  const byId = new Map(crops.map((c) => [c.id, c]))

  const owners = (key: 'regions' | 'provinces', idKey: 'regionId' | 'provinceId', entry: (o: Obj, p: string) => Omit<CropEntry, 'crop'>) =>
    new Map(
      list(root, key, key, (v, p): [string, Owner] => {
        const o = obj(v, p)
        const id = str(o, idKey, p)
        const entries = list(o, 'crops', `${p}.crops`, (c, cp) => {
          const co = obj(c, cp)
          return { crop: cropRef(co, cp, byId), ...entry(co, cp) }
        })
        return [id, { id, status: oneOf(o, 'status', p, STATUSES), entries }]
      }),
    )

  const regions = owners('regions', 'regionId', (o, p) => ({ page: posInt(o, 'page', p), itemId: str(o, 'itemId', p) }))
  const provinces = owners('provinces', 'provinceId', (o, p) => {
    const s = obj(o.source, `${p}.source`)
    return { source: { title: str(s, 'title', `${p}.source`), url: str(s, 'url', `${p}.source`) } }
  })

  const groupsOf = (owner: Owner | undefined) => group(owner && isPublished(owner.status) ? owner.entries : [])
  return {
    crops,
    forRegion: (id) => groupsOf(regions.get(id)),
    forProvince: (id) => groupsOf(provinces.get(id)),
  }
}
