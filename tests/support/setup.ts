import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'
import { installMatchMedia, setViewportWidth } from './viewport'

installMatchMedia()

// Trang được lazy-load; lần nạp đầu khi chạy cả bộ test có thể chậm hơn 1s mặc định
// (có React Compiler, mỗi file còn qua Babel: lần chạy đầu sau khi xoá cache từng quá 3s)
configure({ asyncUtilTimeout: 5000 })

afterEach(() => {
  cleanup()
  localStorage.clear()
  // mặc định của jsdom: 1024px = bố cục desktop
  setViewportWidth(1024)
})
