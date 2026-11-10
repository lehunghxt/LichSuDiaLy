import { renderHook } from '@testing-library/react'
import { useLatest } from '../../../src/lib/useLatest'

test('useLatest keeps the same ref object and always holds the latest value after each render', () => {
  const { result, rerender } = renderHook(({ v }) => useLatest(v), { initialProps: { v: 1 } })
  const first = result.current
  expect(first.current).toBe(1)
  rerender({ v: 2 })
  expect(result.current).toBe(first)
  expect(first.current).toBe(2)
})
