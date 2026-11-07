import { type PointerEvent, useRef, useState } from 'react'

// Dời quá chừng này (px) mới tính là kéo; ít hơn là một lần bấm
const DRAG_SLOP = 4

/** Cử chỉ kéo ở thanh nắm của bottom sheet. `down` là quãng kéo xuống (âm khi kéo lên), null khi không kéo.
 *  Thả tay sau khi kéo: gọi onRelease(down); quãng kéo lấy từ ref nên không phụ thuộc lần render gần nhất.
 *  Trình duyệt vẫn bắn click sau khi kéo: consumeClick() trả true một lần để bỏ qua click đó. */
export function useSheetDrag(onRelease: (down: number) => void) {
  const [down, setDown] = useState<number | null>(null)
  const drag = useRef<{ y: number; down: number; moved: boolean } | null>(null)
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
      e.currentTarget.setPointerCapture?.(e.pointerId)
      drag.current = { y: e.clientY, down: 0, moved: false }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = drag.current
      if (!d) return
      d.down = e.clientY - d.y
      if (Math.abs(d.down) > DRAG_SLOP) d.moved = true
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
