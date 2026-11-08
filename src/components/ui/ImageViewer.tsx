import { ByDevice } from '../layout/ByDevice'
import { LightboxImageViewer } from './image-viewer/ImageViewer.desktop'
import { MobileImageViewer } from './image-viewer/ImageViewer.mobile'
import type { ImageViewerProps } from './image-viewer/parts'

/** Xem ảnh lớn kèm chú thích và ghi nguồn. Điện thoại: bottom sheet; máy tính bảng, desktop: phủ toàn màn hình nền tối */
export function ImageViewer(props: ImageViewerProps) {
  return <ByDevice mobile={<MobileImageViewer {...props} />} desktop={<LightboxImageViewer {...props} />} />
}
