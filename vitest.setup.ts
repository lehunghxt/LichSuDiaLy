import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'
import { installMatchMedia, setViewportWidth } from './src/test/viewport'

installMatchMedia()

// Trang được lazy-load; lần nạp đầu khi chạy cả bộ test có thể chậm hơn 1s mặc định
configure({ asyncUtilTimeout: 3000 })

afterEach(() => {
  cleanup()
  localStorage.clear()
  // mặc định của jsdom: 1024px = bố cục desktop
  setViewportWidth(1024)
})
