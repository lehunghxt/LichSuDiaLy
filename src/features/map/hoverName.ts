import type { Layer } from 'leaflet'

/**
 * Tên vùng/tỉnh hiện theo con trỏ khi rê chuột.
 * - Màn cảm ứng không có: chạm vào sẽ để lại nhãn nằm trên bản đồ, trùng với nhãn ghim.
 * - Vùng/tỉnh đang chọn đã có nhãn ghim, nên cũng không hiện thêm nhãn rê chuột.
 */
export function bindHoverName(layer: Layer, name: string, isSelected: () => boolean) {
  if (!window.matchMedia('(hover: hover)').matches) return
  layer.bindTooltip(name, { sticky: true, className: 'map-tooltip' })
  layer.on('tooltipopen', () => {
    if (isSelected()) layer.closeTooltip()
  })
  layer.on('click', () => layer.closeTooltip())
}
