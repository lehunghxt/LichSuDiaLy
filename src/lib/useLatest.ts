import { useLayoutEffect, useRef } from 'react'

/** Ref luôn giữ giá trị mới nhất (callback từ props) mà không đổi danh tính; cập nhật sau render, không ghi ref trong lúc render */
export function useLatest<T>(value: T) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
