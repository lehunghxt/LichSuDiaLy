// Điều hướng bằng menu desktop, nút Back của trình duyệt
import { expect, test } from './fixtures'

test('the main menu goes to every page, and Back returns', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' })
  const targets = [
    { name: 'Bản đồ khám phá', url: '/ban-do' },
    { name: 'Trắc nghiệm', url: '/on-tap' },
    { name: 'Tiến độ học tập', url: '/tien-do' },
  ]
  for (const { name, url } of targets) {
    await page.goto('/')
    await nav.getByRole('link', { name }).click()
    await expect(page).toHaveURL(url)
  }
  await page.goBack()
  await expect(page).toHaveURL('/')
})
