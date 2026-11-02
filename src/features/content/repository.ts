import rawRegions from '../../data/regions.json'
import type { ContentItem, ContentStatus, RegionContent, RegionMeta, TopicCategory } from '../../types/content'
import type { Quiz } from '../../types/quiz'
import { parseRegionContent, parseRegionList } from './parse'

/** Bản production chỉ hiện nội dung đã được giáo viên duyệt */
export function isPublished(status: ContentStatus): boolean {
  return import.meta.env.PROD ? status === 'verified' : true
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

export function getItemsByCategory(content: RegionContent, category: TopicCategory): ContentItem[] {
  return content.items.filter((i) => i.category === category)
}

type Loader = () => Promise<unknown>

function moduleDefault(mod: unknown): unknown {
  return typeof mod === 'object' && mod !== null && 'default' in mod ? mod.default : mod
}

export function createRepository(rawRegionList: unknown, loaders: Record<string, Loader>) {
  const regions = parseRegionList(rawRegionList)
  const cache = new Map<string, Promise<RegionContent>>()

  async function loadRegionContent(regionId: string): Promise<RegionContent | null> {
    const loader = loaders[regionId]
    if (!loader) return null
    let pending = cache.get(regionId)
    if (!pending) {
      pending = loader().then((mod) => publishedOnly(parseRegionContent(moduleDefault(mod))))
      // Lỗi tải không được cache để "Thử lại" có tác dụng
      pending.catch(() => cache.delete(regionId))
      cache.set(regionId, pending)
    }
    return pending
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

  return {
    getRegions: (): RegionMeta[] => regions,
    loadRegionContent,
    findItem,
    findQuiz,
  }
}

const regionModules = import.meta.glob('../../data/regions/*.json')
const loaders = Object.fromEntries(
  Object.entries(regionModules).map(([file, load]) => [file.replace(/^.*\/(.+)\.json$/, '$1'), load]),
)

export const repository = createRepository(rawRegions, loaders)
