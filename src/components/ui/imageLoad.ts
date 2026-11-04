/** Ảnh đã có sẵn trong bộ nhớ đệm có thể tải xong trước khi React gắn onLoad: kiểm tra ngay khi gắn vào DOM */
export const markIfComplete = (setLoaded: (v: boolean) => void) => (el: HTMLImageElement | null) => {
  if (el?.complete && el.naturalWidth > 0) setLoaded(true)
}
