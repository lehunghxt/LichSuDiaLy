import { defineConfig, devices } from '@playwright/test'

// E2E chạy trên bản build (dist/) qua `vite preview`, giống lúc triển khai: `npm run test:e2e` build trước rồi chạy
const PORT = 4173

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'vi-VN',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /\.mobile\.spec\.ts$/ },
    // Điện thoại: chỉ các luồng không phụ thuộc menu desktop, cộng các spec riêng *.mobile.spec.ts
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /(smoke|quiz|\.mobile)\.spec\.ts$/ },
  ],
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
