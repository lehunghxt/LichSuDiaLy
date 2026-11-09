// Số liệu Trang chủ, tính lúc build từ JSON nội dung (module ảo "virtual:home-summary", xem vite.config.ts).
// Trang chủ chỉ cần đếm và vài dòng chữ: nhúng sẵn gói nhỏ này thay cho tải nội dung đầy đủ của cả bốn vùng.
// Phải lọc theo cùng quy tắc xuất bản với repository (src/lib/publishing.ts); test so khớp hai bên.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const SECTIONS = ['thien-nhien', 'dan-cu-san-xuat', 'van-hoa', 'lich-su']

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

/** Mọi file JSON mà số liệu phụ thuộc (để Vite tính lại khi một file đổi) */
export function summarySourceFiles(dataDir) {
  const regionsDir = path.join(dataDir, 'regions')
  const files = [path.join(dataDir, 'regions.json')]
  for (const id of existsSync(regionsDir) ? readdirSync(regionsDir) : []) {
    const dir = path.join(regionsDir, id)
    for (const name of ['region.json', 'quizzes.json', 'outline.json']) {
      if (existsSync(path.join(dir, name))) files.push(path.join(dir, name))
    }
    const sections = path.join(dir, 'sections')
    if (existsSync(sections)) files.push(...readdirSync(sections).map((f) => path.join(sections, f)))
  }
  return files
}

/**
 * @param {string} dataDir thư mục src/data
 * @param {(status: string) => boolean} isPublished quy tắc xuất bản
 */
export function buildHomeSummary(dataDir, isPublished) {
  const regions = readJson(path.join(dataDir, 'regions.json'))
  return {
    regions: regions.flatMap((region) => {
      const dir = path.join(dataDir, 'regions', region.id)
      const at = (name) => path.join(dir, name)
      const sectionFiles = SECTIONS.filter((s) => existsSync(at(`sections/${s}.json`)))
      // Như repository: vùng chỉ có outline.json là vùng chưa có nội dung
      if (!existsSync(at('region.json')) && !existsSync(at('quizzes.json')) && sectionFiles.length === 0) return []

      const items = sectionFiles.flatMap((s) => readJson(at(`sections/${s}.json`))).filter((i) => isPublished(i.status))
      const ids = new Set(items.map((i) => i.id))
      const quizzes = existsSync(at('quizzes.json')) ? readJson(at('quizzes.json')) : []
      const outline = existsSync(at('outline.json')) ? readJson(at('outline.json')) : { sections: [] }
      return [
        {
          id: region.id,
          items: items.map((i) => ({ id: i.id, title: i.title })),
          questions: quizzes.reduce((n, q) => n + q.questions.filter((x) => isPublished(x.status)).length, 0),
          funFacts: items.flatMap((i) => (i.funFacts ?? []).map((fact) => ({ fact, itemId: i.id }))),
          sections: outline.sections.map((s) => ({
            id: s.id,
            topics: s.topics.length,
            filled: s.topics.filter((t) => t.itemIds.some((id) => ids.has(id))).length,
          })),
        },
      ]
    }),
  }
}
