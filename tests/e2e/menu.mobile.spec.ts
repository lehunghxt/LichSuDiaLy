// Điện thoại: menu ☰ trượt từ bên phải, chọn trang thì đóng menu
import { expect, test } from './fixtures'

test('☰ opens the side menu; choosing a page navigates and closes it', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Mở menu' }).click()
  const sheet = page.getByRole('dialog', { name: 'Menu' })
  await expect(sheet).toBeVisible()
  await sheet.getByRole('link', { name: /Trắc nghiệm/ }).click()
  await expect(page).toHaveURL('/on-tap')
  await expect(sheet).toBeHidden()
})
