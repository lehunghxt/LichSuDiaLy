import { useSyncExternalStore } from 'react'
import { STACKED_VIEWPORT } from '../features/map/fit'

const QUERY = `(min-width: ${STACKED_VIEWPORT}px)`

function subscribe(onChange: () => void) {
  const mq = window.matchMedia?.(QUERY)
  mq?.addEventListener('change', onChange)
  return () => mq?.removeEventListener('change', onChange)
}

/** Màn rộng (từ mốc lg) dùng bố cục desktop; nhỏ hơn dùng bố cục điện thoại, máy tính bảng dựng đứng */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia?.(QUERY).matches ?? true)
}
