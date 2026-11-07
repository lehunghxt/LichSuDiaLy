import { useSyncExternalStore } from 'react'

/** Loại thiết bị quyết định bố cục: mỗi loại có file bố cục riêng (xem docs/superpowers/specs/2026-11-07-device-layouts-design.md) */
export type Device = 'mobile' | 'tablet' | 'desktop'

// Mốc md và lg của Tailwind
export const TABLET_MIN = 768
export const DESKTOP_MIN = 1024

export function deviceOf(width: number): Device {
  if (width >= DESKTOP_MIN) return 'desktop'
  return width >= TABLET_MIN ? 'tablet' : 'mobile'
}

const QUERIES = [`(min-width: ${TABLET_MIN}px)`, `(min-width: ${DESKTOP_MIN}px)`]

function subscribe(onChange: () => void) {
  const mqs = QUERIES.map((q) => window.matchMedia?.(q)).filter((mq): mq is MediaQueryList => mq !== undefined)
  for (const mq of mqs) mq.addEventListener('change', onChange)
  return () => {
    for (const mq of mqs) mq.removeEventListener('change', onChange)
  }
}

/** Thiết bị hiện tại theo bề rộng cửa sổ; đổi khi xoay màn hình hoặc kéo cỡ cửa sổ */
export function useDevice(): Device {
  return useSyncExternalStore(subscribe, () => deviceOf(window.innerWidth))
}
