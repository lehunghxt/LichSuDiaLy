// Kiểm tra toàn vẹn nội dung (chạy trong test, không chạy lúc người dùng xem web).
// Trả về danh sách lỗi dễ đọc cho biên tập viên; rỗng nghĩa là dữ liệu hợp lệ.
import type { ContentItem, RegionContent, RegionMeta, SourceRef } from '../../types/content'

// Khung bao lãnh thổ Việt Nam, gồm cả quần đảo Hoàng Sa và Trường Sa
const VN_BBOX = { minLat: 8.0, maxLat: 23.4, minLng: 102.1, maxLng: 117.9 }

const citesSgk = (sources: SourceRef[], sgkUrl: string) => sources.some((s) => s.url === sgkUrl)

export function checkIntegrity(
  contents: RegionContent[],
  regions: RegionMeta[],
  manifestIds: ReadonlySet<string>,
  sgkUrl: string,
): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  const claim = (id: string) => {
    if (seen.has(id)) problems.push(`trùng id "${id}"`)
    seen.add(id)
  }

  for (const r of regions) claim(r.id)

  for (const content of contents) {
    const regionId = content.region.id
    const prefix = `${regionId}__`
    if (!regions.some((r) => r.id === regionId)) problems.push(`vùng "${regionId}" chưa khai báo trong regions.json`)

    const items = new Map<string, ContentItem>(content.items.map((i) => [i.id, i]))

    for (const item of content.items) {
      claim(item.id)
      if (!item.id.startsWith(prefix)) problems.push(`"${item.id}" phải bắt đầu bằng "${prefix}"`)
      if (item.regionId !== regionId) problems.push(`${item.id}: regionId "${item.regionId}" khác vùng "${regionId}"`)
      for (const rel of item.relatedIds) {
        if (!items.has(rel)) problems.push(`${item.id}.relatedIds: không có "${rel}"`)
      }
      for (const img of item.images) {
        if (!manifestIds.has(img.imageId)) problems.push(`${item.id}: ảnh "${img.imageId}" chưa có trong image-manifest.json`)
      }
      if (item.location) {
        const { lat, lng } = item.location
        if (lat < VN_BBOX.minLat || lat > VN_BBOX.maxLat || lng < VN_BBOX.minLng || lng > VN_BBOX.maxLng) {
          problems.push(`${item.id}: tọa độ nằm ngoài lãnh thổ Việt Nam (${lat}, ${lng})`)
        }
      }
      if (item.status === 'verified' && !citesSgk(item.sources, sgkUrl)) {
        problems.push(`${item.id}: đã duyệt nhưng chưa trích nguồn SGK`)
      }
    }

    for (const quiz of content.quizzes) {
      claim(quiz.id)
      if (!quiz.id.startsWith(prefix)) problems.push(`"${quiz.id}" phải bắt đầu bằng "${prefix}"`)
      for (const q of quiz.questions) {
        const where = `${quiz.id}/${q.id}`
        if (q.status === 'verified' && !citesSgk(q.sources, sgkUrl)) {
          problems.push(`${where}: đã duyệt nhưng chưa trích nguồn SGK`)
        }
        if (q.type === 'map_locate') {
          for (const id of q.candidateItemIds) {
            const target = items.get(id)
            if (!target) problems.push(`${where}: không có địa danh "${id}"`)
            else if (!target.location) problems.push(`${where}: "${id}" chưa có tọa độ`)
          }
        }
      }
    }
  }
  return problems
}
