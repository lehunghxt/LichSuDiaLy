// Mỗi trang mở thẳng bằng đường dẫn (SPA fallback trên máy chủ) đều hiện được, không lỗi JavaScript
import { expect, test } from './fixtures'

const pages = [
  { path: '/', heading: /Em khám phá Lịch sử và Địa lý Việt Nam/ },
  { path: '/ban-do', heading: 'Bản đồ khám phá' },
  { path: '/on-tap', heading: /Trắc nghiệm|Ôn tập/ },
  { path: '/tien-do', heading: 'Tiến độ học tập' },
  { path: '/nguon-anh', heading: /Nguồn ảnh/ },
  { path: '/nguon-tham-khao', heading: /Nguồn tham khảo/ },
]

for (const { path, heading } of pages) {
  test(`${path} loads with its heading`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeAttached()
  })
}

test('the page title and language are set', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
})

test('an unknown address shows the not-found page with a way home', async ({ page }) => {
  await page.goto('/trang-khong-co')
  await expect(page.getByText('Không tìm thấy trang em cần')).toBeVisible()
  await page.getByRole('link', { name: 'Về trang chủ' }).click()
  await expect(page).toHaveURL('/')
})

test('no horizontal scrolling on the home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
