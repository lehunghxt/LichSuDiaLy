import { act, renderHook } from '@testing-library/react'
import { setViewportWidth } from '../../support/viewport'
import { deviceOf, useDevice } from '../../../src/lib/device'

test('deviceOf: phones below 768px, tablets 768–1023px, desktop from 1024px', () => {
  expect(deviceOf(375)).toBe('mobile')
  expect(deviceOf(767)).toBe('mobile')
  expect(deviceOf(768)).toBe('tablet')
  expect(deviceOf(1023)).toBe('tablet')
  expect(deviceOf(1024)).toBe('desktop')
})

test('useDevice follows window resizes and rotation', () => {
  setViewportWidth(390)
  const { result } = renderHook(() => useDevice())
  expect(result.current).toBe('mobile')
  act(() => setViewportWidth(820))
  expect(result.current).toBe('tablet')
  act(() => setViewportWidth(1280))
  expect(result.current).toBe('desktop')
})
