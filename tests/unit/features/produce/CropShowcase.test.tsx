import { render, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { CropShowcase } from '../../../../src/features/produce/CropShowcase'
import { parseProduce } from '../../../../src/features/produce/produce'

const data = (f: string) => JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../../../../src/data/produce', f), 'utf8')) as unknown
const produce = parseProduce(data('crops.json'), data('images.json'))

test('region: two groups of crops, each with photo, credit and the SGK page', () => {
  render(<CropShowcase groups={produce.forRegion('nam-bo')} source="sgk" />)
  const section = screen.getByRole('region', { name: 'Cây trồng tiêu biểu' })
  const industrial = within(section).getByRole('list', { name: 'Cây công nghiệp' })
  const other = within(section).getByRole('list', { name: 'Cây nông nghiệp' })
  expect(
    within(industrial)
      .getAllByRole('listitem')
      .map((li) => li.querySelector('h4')?.textContent),
  ).toEqual(['Cao su', 'Điều', 'Hồ tiêu'])
  expect(within(other).getAllByRole('listitem')).toHaveLength(7)
  const rubber = within(industrial).getAllByRole('listitem')[0]!
  expect(within(rubber).getByRole('button', { name: /Xem ảnh lớn/ })).toBeInTheDocument()
  expect(within(rubber).getByRole('link', { name: 'Wikimedia Commons' })).toBeInTheDocument()
  expect(rubber).toHaveTextContent('SGK tr. 103')
  expect(section).not.toHaveTextContent('Ngoài SGK')
})

test('province: labelled "Ngoài SGK" and every crop links its source', () => {
  render(<CropShowcase groups={produce.forProvince('lai-chau')} source="ngoai-sgk" />)
  const section = screen.getByRole('region', { name: 'Cây trồng tiêu biểu' })
  expect(section).toHaveTextContent('Ngoài SGK')
  const tea = within(section).getByRole('list', { name: 'Cây công nghiệp' }).querySelector('li')!
  expect(within(tea).getByRole('link', { name: /Nguồn: Wikipedia tiếng Việt: Lai Châu/ })).toHaveAttribute(
    'href',
    'https://vi.wikipedia.org/wiki/Lai_Ch%C3%A2u',
  )
})

test('a group without crops is not shown; no crops at all shows nothing', () => {
  render(<CropShowcase groups={produce.forRegion('dong-bang-bac-bo')} source="sgk" />)
  expect(screen.queryByRole('list', { name: 'Cây công nghiệp' })).toBeNull()
  expect(screen.getByRole('list', { name: 'Cây nông nghiệp' })).toBeInTheDocument()
  const { container } = render(<CropShowcase groups={produce.forProvince('ha-noi')} source="ngoai-sgk" />)
  expect(container).toBeEmptyDOMElement()
})
