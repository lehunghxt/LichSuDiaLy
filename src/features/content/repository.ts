import rawRegions from '../../data/regions.json'
import type { ContentItem, ContentStatus, RegionContent, RegionMeta, RegionOutline, SectionId } from '../../types/content'
import type { Quiz } from '../../types/quiz'
import { parseRegionContent, parseRegionList } from './parse'
import { parseOutline } from './parseOutline'
import { loadersFromGlob } from './regionFiles'

/** Bản production chỉ hiện nội dung đã được giáo viên duyệt */
/** Bản xem thử: build PROD vẫn hiện nội dung nháp khi đặt VITE_SHOW_DRAFTS=true */
export function showDrafts(): boolean {
  return import.meta.env.VITE_SHOW_DRAFTS === 'true'
}

export function isPublished(status: ContentStatus): boolean {
  return import.meta.env.PROD && !showDrafts() ? status === 'verified' : true
}

/** Quy ước id: "<regionId>__<slug>" để suy ra vùng mà không phải nạp mọi vùng */
export function regionIdOf(id: string): string | null {
  const [regionId, slug] = id.split('__')
  return regionId && slug ? regionId : null
}

function publishedOnly(content: RegionContent): RegionContent {
  const items = content.items.filter((i) => isPublished(i.status))
  const ids = new Set(items.map((i) => i.id))
  return {
    ...content,
    items: items.map((i) => ({ ...i, relatedIds: i.relatedIds.filter((id) => ids.has(id)) })),
    quizzes: content.quizzes.map((q) => ({ ...q, questions: q.questions.filter((x) => isPublished(x.status)) })),
  }
}

export function getItemsBySection(content: RegionContent, section: SectionId): ContentItem[] {
  return content.items.filter((i) => i.section === section)
}

type Loader = () => Promise<unknown>

function moduleDefault(mod: unknown): unknown {
  return typeof mod === 'object' && mod !== null && 'default' in mod ? mod.default : mod
}

export function createRepository(rawRegionList: unknown, loaders: Record<string, Loader>, outlineLoaders: Record<string, Loader> = {}) {
  const regions = parseRegionList(rawRegionList)
  const cache = new Map<string, Promise<RegionContent>>()

  async function loadRegionContent(regionId: string): Promise<RegionContent | null> {
    const loader = loaders[regionId]
    if (!loader) return null
    let pending = cache.get(regionId)
    if (!pending) {
      pending = loader().then((mod) => parseRegionContent(moduleDefault(mod)))
      // Lỗi tải không được cache để "Thử lại" có tác dụng
      pending.catch(() => cache.delete(regionId))
      cache.set(regionId, pending)
    }
    // Lọc khi trả về (không lọc trong cache) để quy tắc xuất bản luôn áp dụng đúng
    return publishedOnly(await pending)
  }

  async function findItem(itemId: string): Promise<{ item: ContentItem; content: RegionContent } | null> {
    const regionId = regionIdOf(itemId)
    const content = regionId ? await loadRegionContent(regionId) : null
    const item = content?.items.find((i) => i.id === itemId)
    return content && item ? { item, content } : null
  }

  async function findQuiz(quizId: string): Promise<{ quiz: Quiz; content: RegionContent } | null> {
    const regionId = regionIdOf(quizId)
    const content = regionId ? await loadRegionContent(regionId) : null
    const quiz = content?.quizzes.find((q) => q.id === quizId)
    return content && quiz ? { quiz, content } : null
  }

  /** Dàn ý vùng (phần → mục); vùng chưa có outline.json → null */
  async function loadOutline(regionId: string): Promise<RegionOutline | null> {
    const loader = outlineLoaders[regionId]
    return loader ? parseOutline(moduleDefault(await loader()), regionId, `${regionId}/outline.json`) : null
  }

  return {
    getRegions: (): RegionMeta[] => regions,
    loadRegionContent,
    loadOutline,
    findItem,
    findQuiz,
  }
}

// Mỗi vùng là một thư mục trong src/data/regions (xem regionFiles.ts)
const regionModules = import.meta.glob('../../data/regions/**/*.json')
const outlineModules = import.meta.glob('../../data/regions/*/outline.json')
const outlineLoaders = Object.fromEntries(
  Object.entries(outlineModules).map(([file, load]) => [file.split('/').at(-2) ?? file, load] as const),
)

export const repository = createRepository(rawRegions, loadersFromGlob(rawRegions, regionModules), outlineLoaders)
