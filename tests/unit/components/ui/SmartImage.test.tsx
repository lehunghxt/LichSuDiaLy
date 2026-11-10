import { fireEvent, render, screen } from '@testing-library/react'
import type { ImageRef } from '../../../../src/types/content'
import { SmartImage } from '../../../../src/components/ui/SmartImage'

vi.mock('../../../../src/data/image-manifest.json', () => ({
  default: {
    'ruong-bac-thang': { width: 1600, height: 1067, widths: [320, 640, 1024, 1600], lqip: 'data:image/webp;base64,AAAA' },
  },
}))

const image: ImageRef = {
  imageId: 'ruong-bac-thang',
  alt: 'Ruộng bậc thang trên sườn núi',
  credit: 'Tác giả A / Wikimedia Commons',
  license: 'CC BY-SA 4.0',
}

test('renders <picture> with avif and webp srcset from manifest', () => {
  const { container } = render(<SmartImage image={image} sizes="100vw" />)
  const sources = container.querySelectorAll('picture > source')
  expect(sources).toHaveLength(2)
  expect(sources[0]).toHaveAttribute('type', 'image/avif')
  expect(sources[0]?.getAttribute('srcset')).toContain('/images/ruong-bac-thang-640.avif 640w')
  expect(sources[1]).toHaveAttribute('type', 'image/webp')
  expect(sources[1]?.getAttribute('srcset')).toContain('/images/ruong-bac-thang-1600.webp 1600w')
  expect(sources[0]).toHaveAttribute('sizes', '100vw')
})

test('img has loading=lazy, decoding=async, width/height from manifest', () => {
  render(<SmartImage image={image} sizes="100vw" />)
  const img = screen.getByRole('img', { name: image.alt })
  expect(img).toHaveAttribute('loading', 'lazy')
  expect(img).toHaveAttribute('decoding', 'async')
  expect(img).toHaveAttribute('width', '1600')
  expect(img).toHaveAttribute('height', '1067')
})

test('priority sets loading=eager and fetchpriority=high', () => {
  render(<SmartImage image={image} sizes="100vw" priority />)
  const img = screen.getByRole('img', { name: image.alt })
  expect(img).toHaveAttribute('loading', 'eager')
  expect(img).toHaveAttribute('fetchpriority', 'high')
})

test('unknown imageId renders placeholder with role=img and alt', () => {
  const { container } = render(<SmartImage image={{ ...image, imageId: 'khong-co' }} sizes="100vw" />)
  expect(screen.getByRole('img', { name: image.alt })).toHaveTextContent('Hình ảnh đang được cập nhật')
  expect(container.querySelector('img')).toBeNull()
})

test('onError swaps to placeholder', () => {
  const { container } = render(<SmartImage image={image} sizes="100vw" />)
  const img = container.querySelector('img')
  expect(img).not.toBeNull()
  if (img) fireEvent.error(img)
  expect(container.querySelector('img')).toBeNull()
  expect(screen.getByRole('img', { name: image.alt })).toHaveTextContent('Hình ảnh đang được cập nhật')
})

test('shows credit text in figcaption', () => {
  render(<SmartImage image={image} sizes="100vw" showCredit />)
  expect(screen.getByText('Ảnh: Tác giả A / Wikimedia Commons (CC BY-SA 4.0)')).toBeInTheDocument()
})
