import { fireEvent, render, screen, within } from '@testing-library/react'
import type { WebImage } from '../../types/content'
import { WebImageFigure } from './WebImageFigure'

const U = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/F.jpg'

function image(over: Partial<WebImage['attribution']> = {}): WebImage {
  return {
    id: 'lao-cai__f',
    provider: 'wikimedia-commons',
    regionId: 'r',
    provinceId: 'lao-cai',
    section: 'thien-nhien',
    itemIds: [],
    alt: 'Đỉnh núi trong mây',
    caption: 'Đỉnh Phan-xi-păng (tỉnh Lào Cai).',
    src: {
      url: `${U}/960px-F.jpg`,
      width: 960,
      height: 240,
      srcset: [
        { url: `${U}/500px-F.jpg`, width: 500 },
        { url: `${U}/960px-F.jpg`, width: 960 },
      ],
    },
    attribution: {
      title: 'File:F.jpg',
      author: 'Christophe95',
      authorUrl: 'https://commons.wikimedia.org/wiki/User:Christophe95',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:F.jpg',
      ...over,
    },
    status: 'draft',
  }
}

test('renders img with commons srcset, alt, width/height, lazy, no referrer', () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  const img = screen.getByRole('img', { name: 'Đỉnh núi trong mây' })
  expect(img).toHaveAttribute('src', `${U}/960px-F.jpg`)
  expect(img).toHaveAttribute('srcset', `${U}/500px-F.jpg 500w, ${U}/960px-F.jpg 960w`)
  expect(img).toHaveAttribute('sizes', '50vw')
  expect(img).toHaveAttribute('width', '960')
  expect(img).toHaveAttribute('height', '240')
  expect(img).toHaveAttribute('loading', 'lazy')
  expect(img).toHaveAttribute('referrerpolicy', 'no-referrer')
})

test('priority image loads eagerly', () => {
  render(<WebImageFigure image={image()} sizes="50vw" priority />)
  expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
})

test('caption and credit links to author, license and source page', () => {
  render(<WebImageFigure image={image()} sizes="50vw" showCaption />)
  const fig = screen.getByRole('figure')
  expect(fig).toHaveTextContent('Đỉnh Phan-xi-păng (tỉnh Lào Cai).')
  expect(within(fig).getByRole('link', { name: 'Christophe95' })).toHaveAttribute('href', 'https://commons.wikimedia.org/wiki/User:Christophe95')
  expect(within(fig).getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0')
  const source = within(fig).getByRole('link', { name: 'Wikimedia Commons' })
  expect(source).toHaveAttribute('href', 'https://commons.wikimedia.org/wiki/File:F.jpg')
  expect(source).toHaveAttribute('target', '_blank')
  expect(source).toHaveAttribute('rel', 'noopener noreferrer')
})

test('author and license without url are plain text', () => {
  render(<WebImageFigure image={image({ authorUrl: undefined, license: 'Public domain', licenseUrl: undefined })} sizes="50vw" />)
  const fig = screen.getByRole('figure')
  expect(fig).toHaveTextContent('Christophe95')
  expect(fig).toHaveTextContent('Public domain')
  expect(within(fig).getAllByRole('link')).toHaveLength(1)
})

test('on load error shows fallback text but keeps the credit links', () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  fireEvent.error(screen.getByRole('img', { name: 'Đỉnh núi trong mây' }))
  expect(screen.getByText('Hình ảnh hiện không tải được')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Wikimedia Commons' })).toBeInTheDocument()
})

test('frame keeps 4:3 aspect for a panorama', () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  expect(screen.getByTestId('web-image-frame')).toHaveStyle({ aspectRatio: '4 / 3' })
})

test('tapping the image opens it full screen with caption and credit; "Đóng ảnh" closes it', async () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  const open = screen.getByRole('button', { name: 'Xem ảnh lớn: Đỉnh núi trong mây' })
  fireEvent.click(open)
  const viewer = screen.getByRole('dialog', { name: 'Đỉnh núi trong mây' })
  const big = within(viewer).getByRole('img', { name: 'Đỉnh núi trong mây' })
  expect(big).toHaveAttribute('sizes', '100vw')
  expect(big.getAttribute('srcset')).toContain('960px-F.jpg 960w')
  expect(viewer).toHaveTextContent('Đỉnh Phan-xi-păng (tỉnh Lào Cai).')
  expect(viewer).toHaveTextContent('Christophe95')
  const close = within(viewer).getByRole('button', { name: 'Đóng ảnh' })
  expect(close).toHaveFocus()
  fireEvent.click(close)
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(open).toHaveFocus()
})

test('Escape closes only the image viewer, not a modal listening underneath', () => {
  const underneath = vi.fn()
  document.addEventListener('keydown', underneath)
  render(<WebImageFigure image={image()} sizes="50vw" />)
  fireEvent.click(screen.getByRole('button', { name: /Xem ảnh lớn/ }))
  fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(underneath).not.toHaveBeenCalled()
  document.removeEventListener('keydown', underneath)
})

test('clicking the dark backdrop closes the viewer; a broken image cannot be opened', () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  fireEvent.click(screen.getByRole('button', { name: /Xem ảnh lớn/ }))
  fireEvent.click(screen.getByTestId('image-viewer-backdrop'))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.error(screen.getByRole('img'))
  expect(screen.queryByRole('button', { name: /Xem ảnh lớn/ })).not.toBeInTheDocument()
})

test('shows a skeleton while the image loads, then fades the image in', () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  const frame = screen.getByTestId('web-image-frame')
  const img = screen.getByRole('img')
  expect(within(frame).getByTestId('image-skeleton')).toBeInTheDocument()
  expect(img).toHaveClass('opacity-0')
  fireEvent.load(img)
  expect(within(frame).queryByTestId('image-skeleton')).not.toBeInTheDocument()
  expect(img).toHaveClass('opacity-100')
})

test('no skeleton left behind when the image fails', () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  fireEvent.error(screen.getByRole('img'))
  expect(screen.queryByTestId('image-skeleton')).not.toBeInTheDocument()
  expect(screen.getByText('Hình ảnh hiện không tải được')).toBeInTheDocument()
})

test('full-screen viewer shows a skeleton until the large image loads', () => {
  render(<WebImageFigure image={image()} sizes="50vw" />)
  fireEvent.click(screen.getByRole('button', { name: /Xem ảnh lớn/ }))
  const viewer = screen.getByRole('dialog')
  expect(within(viewer).getByTestId('image-skeleton')).toBeInTheDocument()
  fireEvent.load(within(viewer).getByRole('img'))
  expect(within(viewer).queryByTestId('image-skeleton')).not.toBeInTheDocument()
})
