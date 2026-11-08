import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../../app/router'

vi.mock('../../features/images/library', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../../features/images/library')>()
  const img = {
    id: 'can-tho__cho',
    provider: 'wikimedia-commons',
    provinceId: 'can-tho',
    section: 'van-hoa',
    itemIds: [],
    alt: 'Chợ nổi',
    caption: 'Chợ nổi Cái Răng (TP. Cần Thơ).',
    src: { url: 'https://upload.wikimedia.org/wikipedia/commons/a.jpg', width: 4, height: 3, srcset: [] },
    attribution: {
      title: 'File:Cho noi.jpg',
      author: 'Người chụp',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cho_noi.jpg',
    },
    status: 'verified',
  }
  return {
    ...orig,
    imageLibrary: orig.createImageLibrary({ '../../data/images/nam-bo/can-tho.json': () => Promise.resolve({ default: [img] }) }),
  }
})

function renderAt(path: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)
}

test('/nguon-anh lists every image with author, license and a link to the original page', async () => {
  renderAt('/nguon-anh')
  expect(await screen.findByRole('heading', { level: 1, name: 'Nguồn ảnh' })).toBeInTheDocument()
  const table = await screen.findByRole('table')
  const headers = within(table)
    .getAllByRole('columnheader')
    .map((h) => h.textContent)
  expect(headers).toEqual(['Ảnh', 'Tỉnh', 'Tác giả', 'Giấy phép', 'Trang gốc'])
  const row = within(table).getAllByRole('row')[1]!
  expect(row).toHaveTextContent('Chợ nổi Cái Răng (TP. Cần Thơ).')
  expect(row).toHaveTextContent('Cần Thơ')
  expect(row).toHaveTextContent('Người chụp')
  expect(within(row).getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0')
  expect(within(row).getByRole('link', { name: 'File:Cho noi.jpg' })).toHaveAttribute(
    'href',
    'https://commons.wikimedia.org/wiki/File:Cho_noi.jpg',
  )
})

test('/nguon-anh also credits the crop photos, marked "Cây trồng"', async () => {
  renderAt('/nguon-anh')
  const table = await screen.findByRole('table')
  const tea = (await within(table).findByText('Đồi chè ở tỉnh Thái Nguyên.')).closest('tr')!
  expect(tea).toHaveTextContent('Cây trồng')
  expect(within(tea).getByRole('link', { name: 'File:Tea plantation in Thai Nguyen.jpg' })).toBeInTheDocument()
})

test('footer links to the image credits page', async () => {
  renderAt('/')
  const footer = await screen.findByRole('contentinfo')
  expect(within(footer).getByRole('link', { name: 'Nguồn ảnh' })).toHaveAttribute('href', '/nguon-anh')
})
