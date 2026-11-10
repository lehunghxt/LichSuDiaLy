import { act, renderHook, waitFor } from '@testing-library/react'
import { rawRegionContent } from '../../../support/fixtures'
import { createRepository } from '../../../../src/features/content/repository'
import { useRegionContent } from '../../../../src/features/content/useRegionContent'

const regions = [rawRegionContent().region]

test('loading → ready with content', async () => {
  const repo = createRepository(regions, { 'vung-a': async () => ({ default: rawRegionContent() }) })
  const { result } = renderHook(() => useRegionContent('vung-a', repo))
  expect(result.current.status).toBe('loading')
  await waitFor(() => expect(result.current.status).toBe('ready'))
  expect(result.current.content?.region.id).toBe('vung-a')
})

test('unknown id → not_found', async () => {
  const repo = createRepository(regions, {})
  const { result } = renderHook(() => useRegionContent('vung-x', repo))
  await waitFor(() => expect(result.current.status).toBe('not_found'))
})

test('undefined id → not_found', async () => {
  const repo = createRepository(regions, {})
  const { result } = renderHook(() => useRegionContent(undefined, repo))
  await waitFor(() => expect(result.current.status).toBe('not_found'))
})

test('loader error → error, retry recovers', async () => {
  let fail = true
  const repo = createRepository(regions, {
    'vung-a': async () => {
      if (fail) throw new Error('network')
      return { default: rawRegionContent() }
    },
  })
  const { result } = renderHook(() => useRegionContent('vung-a', repo))
  await waitFor(() => expect(result.current.status).toBe('error'))
  fail = false
  act(() => result.current.retry())
  await waitFor(() => expect(result.current.status).toBe('ready'))
})
