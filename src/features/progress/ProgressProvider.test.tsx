import { act, render } from '@testing-library/react'
import { ProgressProvider } from './ProgressProvider'
import { useProgress } from './useProgress'

test('the progress actions keep their identity when the progress changes, so effects that depend on them do not rerun', () => {
  const seen: ReturnType<typeof useProgress>[] = []
  function Probe() {
    seen.push(useProgress())
    return null
  }
  render(
    <ProgressProvider>
      <Probe />
    </ProgressProvider>,
  )
  const first = seen.at(-1)!
  act(() => first.markRegionVisited('vung-a'))
  const after = seen.at(-1)!
  expect(after.state.visitedRegionIds).toEqual(['vung-a'])
  expect(after.state).not.toBe(first.state)
  for (const key of ['markRegionVisited', 'markItemViewed', 'markItemsViewed', 'recordQuiz', 'reset'] as const) {
    expect(after[key]).toBe(first[key])
  }
})
