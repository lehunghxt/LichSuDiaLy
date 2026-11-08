import type { ReactNode } from 'react'
import { useDevice } from '../../lib/device'

interface ByDeviceProps {
  mobile: ReactNode
  /** Bỏ trống thì máy tính bảng dùng bố cục desktop */
  tablet?: ReactNode
  desktop: ReactNode
}

/** Chọn bố cục theo thiết bị (lib/device.ts); đổi ngay khi màn hình qua mốc, ví dụ xoay máy tính bảng */
export function ByDevice({ mobile, tablet, desktop }: ByDeviceProps) {
  const device = useDevice()
  if (device === 'mobile') return mobile
  if (device === 'tablet') return tablet ?? desktop
  return desktop
}
