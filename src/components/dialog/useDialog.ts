import { type KeyboardEvent, type RefObject, useEffect } from 'react'
import { useLatest } from '../../lib/useLatest'

// Các hộp thoại đang mở, hộp mở sau ở cuối (ảnh phóng to mở chồng lên khung xem bài)
const stack: { id: symbol; el: () => HTMLElement | null }[] = []

/** Hộp trên cùng: hộp mở sau cùng trong số các hộp không chứa hộp khác.
 *  (Hai hộp lồng nhau gắn cùng lúc thì effect của hộp con chạy trước, nên không dựa riêng vào thứ tự mở) */
function topId(): symbol | undefined {
  const open = stack.filter((a) => !stack.some((b) => b !== a && a.el()?.contains(b.el())))
  return open[open.length - 1]?.id
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), audio[controls], [tabindex]:not([tabindex="-1"])'

/** Hành vi chung của hộp thoại (bottom sheet hay toàn màn hình):
 *  khoá cuộn trang, đưa focus vào trong (ô chỉ định, hoặc phần tử bấm được đầu tiên), Esc đóng hộp trên cùng, giữ Tab trong hộp,
 *  đóng thì trả focus về chỗ cũ. Trả về hàm onKeyDown gắn vào phần tử hộp thoại. */
export function useDialog(dialogRef: RefObject<HTMLElement | null>, onClose: () => void, initialFocusRef?: RefObject<HTMLElement | null>) {
  const close = useLatest(onClose)

  useEffect(() => {
    const id = Symbol('dialog')
    stack.push({ id, el: () => dialogRef.current })
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = initialFocusRef?.current ?? dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()
    // Bắt ở pha capture; chỉ hộp trên cùng xử lý, rồi chặn không cho Esc lan xuống (hộp bên dưới, trình nghe khác)
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || topId() !== id) return
      e.stopPropagation()
      close.current()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      stack.splice(
        stack.findIndex((d) => d.id === id),
        1,
      )
      document.body.style.overflow = overflow
      if (previous instanceof HTMLElement) previous.focus()
    }
    // Chỉ chạy khi mở/đóng hộp thoại
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return
    // Không để hộp thoại bên dưới (cha trong cây React) xử lý tiếp phím Tab này
    e.stopPropagation()
    const nodes = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
