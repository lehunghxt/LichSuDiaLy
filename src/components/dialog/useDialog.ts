import { type KeyboardEvent, type RefObject, useEffect } from 'react'
import { useLatest } from '../../lib/useLatest'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), audio[controls], [tabindex]:not([tabindex="-1"])'

/** Hành vi chung của hộp thoại (bottom sheet hay toàn màn hình):
 *  khoá cuộn trang, đưa focus vào trong (ô chỉ định, hoặc phần tử bấm được đầu tiên), Esc để đóng, giữ Tab trong hộp,
 *  đóng thì trả focus về chỗ cũ. Trả về hàm onKeyDown gắn vào phần tử hộp thoại. */
export function useDialog(dialogRef: RefObject<HTMLElement | null>, onClose: () => void, initialFocusRef?: RefObject<HTMLElement | null>) {
  const close = useLatest(onClose)

  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const first = initialFocusRef?.current ?? dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (previous instanceof HTMLElement) previous.focus()
    }
    // Chỉ chạy khi mở/đóng hộp thoại
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return
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
