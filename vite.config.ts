import { readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { buildHomeSummary, summarySourceFiles } from './scripts/lib/home-summary.mjs'
import { serviceWorkerSource } from './scripts/lib/service-worker.mjs'

const DATA_DIR = path.resolve(import.meta.dirname, 'src/data')

/** "virtual:home-summary": số liệu Trang chủ tính sẵn lúc build (scripts/lib/home-summary.mjs) */
function homeSummary(): Plugin {
  const id = 'virtual:home-summary'
  const resolved = `\0${id}`
  let isPublished: (status: string) => boolean = () => true
  return {
    name: 'home-summary',
    configResolved(config) {
      // Cùng quy tắc với src/lib/publishing.ts: bản production chỉ lấy nội dung đã duyệt
      const onlyVerified = config.env.PROD === true
      isPublished = (status) => !onlyVerified || status === 'verified'
    },
    resolveId: (source) => (source === id ? resolved : undefined),
    load(source) {
      if (source !== resolved) return
      for (const file of summarySourceFiles(DATA_DIR)) this.addWatchFile(file)
      return `export default ${JSON.stringify(buildHomeSummary(DATA_DIR, isPublished))}`
    },
  }
}

/** Sau khi build xong (đã chép public/): ghi dist/sw.js với danh sách file cần lưu sẵn */
function serviceWorker(): Plugin {
  let outDir = ''
  let base = '/'
  return {
    name: 'service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
      base = config.base
    },
    closeBundle() {
      const files = (readdirSync(outDir, { recursive: true }) as string[])
        .filter((f) => statSync(path.join(outDir, f)).isFile())
        .map((f) => f.split(path.sep).join('/'))
      writeFileSync(path.join(outDir, 'sw.js'), serviceWorkerSource({ base, files }))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  // React Compiler (qua Babel): tự thêm memo cho component và hook lúc build, khỏi viết tay useMemo/useCallback.
  // Các useMemo/useCallback đã có vẫn giữ: compiler tôn trọng chúng
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss(), homeSummary(), serviceWorker()],
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
    // Đủ chỗ cho asyncUtilTimeout 5s trong vitest.setup.ts
    testTimeout: 10_000,
    css: false,
  },
})
