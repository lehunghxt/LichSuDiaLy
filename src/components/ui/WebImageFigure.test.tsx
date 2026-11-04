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
