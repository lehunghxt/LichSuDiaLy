// Truy cập localStorage an toàn: trình duyệt có thể chặn (chế độ riêng tư, chính sách
// của trường học) hoặc đầy bộ nhớ. Không bao giờ ném lỗi ra UI.

export function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // bỏ qua: không xoá được thì lần đọc sau vẫn được parse an toàn
  }
}
