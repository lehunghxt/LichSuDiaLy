// Service worker (dist/sw.js, chỉ có ở bản build): lần sau mất mạng vẫn mở được trang
import { expect, test } from './fixtures'

test('after the first visit, the app still opens offline', async ({ page, context }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  // Đợi service worker điều khiển trang (sau lần tải lại đầu tiên nếu nó không tự claim)
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: /Em khám phá Lịch sử và Địa lý Việt Nam/ })).toBeVisible()
  await page.goto('/on-tap')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
