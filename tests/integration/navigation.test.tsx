// Điều hướng giữa các trang với dữ liệu thật: link cũ /dia-danh/<id>, trang lỗi, trang nguồn
import { screen, within } from '@testing-library/react'
import { itemSlug, repository } from '../../src/features/content'
import { renderApp } from './app'

test('every region in the data loads its content', async () => {
  const regions = repository.getRegions()
  expect(regions).toHaveLength(4)
  for (const region of regions) {
    const content = await repository.loadRegionContent(region.id)
    expect(content, region.id).not.toBeNull()
    expect(content!.items.length, region.id).toBeGreaterThan(0)
  }
})

test('an old item link /dia-danh/<id> redirects to the map at that item', async () => {
  const [region] = repository.getRegions()
  const item = (await repository.loadRegionContent(region!.id))!.items[0]!
  const { router } = renderApp(`/dia-danh/${item.id}`)
  await vi.waitFor(() => expect(router.state.location.pathname).toBe(`/ban-do/${item.regionId}`))
  const params = new URLSearchParams(router.state.location.search)
  expect(params.get('chu-de')).toBe(item.section)
  expect(params.get('muc')).toBe(itemSlug(item.id))
})

test('an unknown item link offers a way back to the map', async () => {
  renderApp('/dia-danh/khong-co-dia-danh-nay')
  expect(await screen.findByText('Không tìm thấy địa danh này')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Về bản đồ' })).toHaveAttribute('href', '/ban-do')
})

test('an unknown quiz link offers a way back to the quiz list', async () => {
  const { user, router } = renderApp('/on-tap/khong-co-bai-nay')
  await user.click(await screen.findByRole('link', { name: 'Về danh sách bài' }))
  expect(router.state.location.pathname).toBe('/on-tap')
})

test('home → quiz list → a quiz → back to the list, all through links', async () => {
  const { user, router } = renderApp('/')
  const nav = await screen.findByRole('navigation', { name: 'Điều hướng chính' })
  await user.click(within(nav).getByRole('link', { name: 'Trắc nghiệm' }))
  const firstCard = (await screen.findAllByRole('link', { name: /Bắt đầu/ }))[0]!
  await user.click(firstCard)
  expect(router.state.location.pathname).toMatch(/^\/on-tap\/.+/)
  await user.click(await screen.findByRole('link', { name: 'Các bài trắc nghiệm' }))
  expect(router.state.location.pathname).toBe('/on-tap')
})

test('sources page lists references collected from the real content', async () => {
  renderApp('/nguon-tham-khao')
  expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
  await vi.waitFor(() => expect(screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('http')).length).toBeGreaterThan(0))
})
