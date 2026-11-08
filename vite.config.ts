import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      treeshake: {
        // features/<x>/index.ts chỉ xuất lại: không có tác dụng phụ, nên Rollup đi thẳng tới file gốc khi chia chunk.
        // Không có dòng này, trang dùng một thứ nhỏ của tính năng sẽ tải kèm cả phần còn lại (Trang chủ tải khung bản đồ)
        moduleSideEffects: (id) => !/[\\/]src[\\/]features[\\/][^\\/]+[\\/]index\.ts$/.test(id),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
  },
})
