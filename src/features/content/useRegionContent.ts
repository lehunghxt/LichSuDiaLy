import { useCallback, useEffect, useState } from 'react'
import type { RegionContent } from '../../types/content'
import { repository } from './repository'

export type RegionContentState =
  | { status: 'loading'; content?: undefined }
  | { status: 'ready'; content: RegionContent }
  | { status: 'not_found'; content?: undefined }
  | { status: 'error'; content?: undefined }

type Repo = Pick<typeof repository, 'loadRegionContent'>

export function useRegionContent(regionId: string | undefined, repo: Repo = repository) {
  const [state, setState] = useState<RegionContentState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })
    const load = regionId ? repo.loadRegionContent(regionId) : Promise.resolve(null)
    load.then(
      (content) => {
        if (!cancelled) setState(content ? { status: 'ready', content } : { status: 'not_found' })
      },
      () => {
        if (!cancelled) setState({ status: 'error' })
      },
    )
    return () => {
      cancelled = true
    }
  }, [regionId, repo, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
