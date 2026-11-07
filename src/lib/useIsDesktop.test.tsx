import { act, renderHook } from '@testing-library/react'
import { setViewportWidth } from '../test/viewport'
import { useIsDesktop } from './useIsDesktop'

test('desktop from 1024px wide, phone/tablet layout below; follows window resizes', () => {
  setViewportWidth(1280)
  const { result } = renderHook(() => useIsDesktop())
  expect(result.current).toBe(true)
  act(() => setViewportWidth(390))
  expect(result.current).toBe(false)
  act(() => setViewportWidth(1024))
  expect(result.current).toBe(true)
})
