import { type PointerEvent, useRef, useState } from 'react'

// Dời quá chừng này (px) mới tính là kéo; ít hơn là một lần bấm
const DRAG_SLOP = 4

/** Cử chỉ kéo một tấm trượt. `down` là quãng kéo theo trục `axis` (y: xuống là dương; x: sang phải là dương),
 *  null khi không kéo. Thả tay sau khi kéo: gọi onRelease(down); quãng kéo lấy từ ref nên không phụ thuộc lần render gần nhất.
 *  Trục x: cử chỉ chủ yếu theo chiều dọc thì bỏ qua, để nội dung bên trong vẫn cuộn được.
 *  Chỉ bắt con trỏ khi đã thật sự kéo, nên bấm vào link, nút bên trong tấm vẫn bình thường.
 *  Trình duyệt vẫn bắn click sau khi kéo: consumeClick() trả true một lần để bỏ qua click đó. */
export function useSheetDrag(onRelease: (down: number) => void, axis: 'x' | 'y' = 'y') {
  const [down, setDown] = useState<number | null>(null)
  const drag = useRef<{ x: number; y: number; down: number; moved: boolean; ignored: boolean } | null>(null)
  const swallowClick = useRef(false)

  const end = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    swallowClick.current = true
    setDown(null)
    onRelease(d.down)
  }

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      // Lần chạm mới: click kèm theo cú kéo trước (nếu trình duyệt không bắn) không còn để bỏ qua
      swallowClick.current = false
      drag.current = { x: e.clientX, y: e.clientY, down: 0, moved: false, ignored: false }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = drag.current
      if (!d || d.ignored) return
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      d.down = axis === 'y' ? dy : dx
      if (!d.moved && Math.max(Math.abs(dx), Math.abs(dy)) > DRAG_SLOP) {
        if (axis === 'x' && Math.abs(dy) > Math.abs(dx)) {
          d.ignored = true
          return
        }
        d.moved = true
        e.currentTarget.setPointerCapture?.(e.pointerId)
      }
      if (d.moved) setDown(d.down)
    },
    onPointerUp: end,
    onPointerCancel: end,
  }

  const consumeClick = () => {
    if (!swallowClick.current) return false
    swallowClick.current = false
    return true
  }

  return { down, handlers, consumeClick }
}
