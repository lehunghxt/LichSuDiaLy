// Bản đồ Leaflet thật (jsdom không vẽ được): vùng, chọn vùng, nút phóng to, ghi tiến độ
import { expect, regions, test } from './fixtures'

test('the map draws the regions from /maps and selecting one opens its panel', async ({ page }) => {
  await page.goto('/ban-do')
  const map = page.locator('.leaflet-container')
  await expect(map).toBeVisible()
  await expect.poll(() => map.locator('.leaflet-overlay-pane path').count()).toBeGreaterThanOrEqual(regions.length)

  const region = regions[0]!
  await page.getByRole('list', { name: 'Các vùng địa lý' }).getByRole('button', { name: region.name }).click()
  await expect(page).toHaveURL(`/ban-do/${region.id}`)
  await expect(page.getByRole('region', { name: region.name })).toBeVisible()
})

test('neighbouring countries are drawn gray under Vietnam, named, and not clickable', async ({ page }) => {
  await page.goto('/ban-do')
  const map = page.locator('.leaflet-container')
  const foreign = map.locator('.leaflet-neighbors-pane path')
  await expect(foreign).toHaveCount(1)
  // Ngăn đất nước ngoài nằm dưới ngăn vùng/tỉnh
  const z = (pane: string) => map.locator(`.leaflet-${pane}-pane`).evaluate((el) => Number(getComputedStyle(el).zIndex))
  expect(await z('neighbors')).toBeLessThan(await z('overlay'))
  await expect(foreign).toHaveCSS('pointer-events', 'none')
  for (const name of ['TRUNG QUỐC', 'LÀO', 'CAM-PU-CHIA']) await expect(map.getByText(name, { exact: true })).toBeVisible()

  // Phóng vào một vùng: vẫn tô xám, nhưng ẩn tên nước để không đè nhãn tên vùng
  await page.goto(`/ban-do/${regions[0]!.id}`)
  await expect(foreign).toHaveCount(1)
  await expect(map.getByText('TRUNG QUỐC', { exact: true })).toHaveCount(0)
})

test('zoom buttons change the map zoom', async ({ page }) => {
  await page.goto('/ban-do')
  const shape = page.locator('.leaflet-overlay-pane path').first()
  await expect(shape).toBeVisible()
  // Phóng to/thu nhỏ có hiệu ứng (cả lúc mở bản đồ); bấm giữa chừng thì Leaflet bỏ qua.
  // Đợi kích thước vùng đứng yên rồi mới đo hoặc bấm tiếp
  const settledWidth = async () => {
    let last = -1
    await expect
      .poll(async () => {
        const [prev, w] = [last, (await shape.boundingBox())!.width]
        last = w
        return prev === w
      })
      .toBe(true)
    return last
  }
  const before = await settledWidth()
  await page.getByRole('button', { name: 'Phóng to' }).click()
  expect(await settledWidth()).toBeGreaterThan(before * 1.5)
  await page.getByRole('button', { name: 'Thu nhỏ' }).click()
  expect(await settledWidth()).toBeCloseTo(before, 0)
})

test('opening a region counts as explored on the progress page', async ({ page }) => {
  const region = regions[1]!
  await page.goto(`/ban-do/${region.id}`)
  await expect(page.getByRole('region', { name: region.name })).toBeVisible()
  // Tiến độ được ghi trong effect: đợi ghi xong rồi mới rời trang
  await expect.poll(() => page.evaluate(() => Object.values(localStorage).join())).toContain(region.id)
  await page.goto('/tien-do')
  const stats = page.getByRole('list', { name: 'Thống kê' })
  await expect(stats.locator('li', { hasText: 'Vùng đã khám phá' })).toContainText(`1/${regions.length}`)
})
