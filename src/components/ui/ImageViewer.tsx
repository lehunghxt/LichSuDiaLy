import { useDevice } from '../../lib/device'
import { LightboxImageViewer } from './image-viewer/LightboxImageViewer'
import { MobileImageViewer } from './image-viewer/MobileImageViewer'
import type { ImageViewerProps } from './image-viewer/parts'

/** Xem ảnh lớn kèm chú thích và ghi nguồn. Điện thoại: bottom sheet; máy tính bảng, desktop: phủ toàn màn hình nền tối */
export function ImageViewer(props: ImageViewerProps) {
  return useDevice() === 'mobile' ? <MobileImageViewer {...props} /> : <LightboxImageViewer {...props} />
}
