import { fireEvent, render, screen } from '@testing-library/react'
import type { MapLocateQuestion } from '../../../../../src/types/quiz'
import { correctAnswerLabel } from '../../../../../src/features/quiz/registry'
import { LocatePins } from '../../../../../src/features/quiz/questions/LocatePins'
import { MapLocate } from '../../../../../src/features/quiz/questions/MapLocate'

const R = 'trung-du-mien-nui-phia-bac'
const question: MapLocateQuestion = {
  id: 'q-map',
  type: 'map_locate',
  prompt: 'Khu di tích Đền Hùng nằm ở điểm nào trên bản đồ?',
  targetItemId: `${R}__den-hung`,
  candidateItemIds: [`${R}__cot-co-lung-cu`, `${R}__den-hung`, `${R}__dinh-phan-xi-pang`],
  explanation: '.',
  sources: [],
  status: 'draft',
}

test('MapLocate lists the candidates as "Điểm A/B/C" without their names; choosing one answers with its item id', async () => {
  const onAnswer = vi.fn()
  render(<MapLocate question={question} onAnswer={onAnswer} locked={false} />)
  const b = await screen.findByRole('button', { name: 'Điểm B' })
  expect(screen.getAllByRole('button', { name: /^Điểm [A-C]$/ })).toHaveLength(3)
  // Tên địa danh không được lộ ra trên các lựa chọn
  expect(screen.queryByText(/Lũng Cú|Phan-xi-păng/)).toBeNull()
  fireEvent.click(b)
  expect(onAnswer).toHaveBeenCalledWith({ type: 'map_locate', itemId: `${R}__den-hung` })
})

test('locked MapLocate disables the choices', async () => {
  render(<MapLocate question={question} answer={{ type: 'map_locate', itemId: `${R}__cot-co-lung-cu` }} onAnswer={vi.fn()} locked />)
  for (const b of await screen.findAllByRole('button', { name: /^Điểm [A-C]$/ })) expect(b).toBeDisabled()
})

test('correct answer label names the point letter of the target', () => {
  expect(correctAnswerLabel(question)).toBe('Điểm B')
})

const square: GeoJSON.FeatureCollection<GeoJSON.Polygon, { regionId: string }> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { regionId: R },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103, 21],
            [106, 21],
            [106, 24],
            [103, 24],
            [103, 21],
          ],
        ],
      },
    },
  ],
}
const pins = [
  { id: 'a', label: 'A', lat: 23.36, lng: 105.31 },
  { id: 'b', label: 'B', lat: 21.36, lng: 105.32 },
]

test('LocatePins draws the region and one lettered pin per candidate; clicking a pin chooses it', () => {
  const onPick = vi.fn()
  const { container } = render(<LocatePins regions={square} regionId={R} pins={pins} onPick={onPick} />)
  expect(container.querySelectorAll('path')).toHaveLength(1)
  const labels = [...container.querySelectorAll('[data-pin]')].map((p) => p.textContent)
  expect(labels).toEqual(['A', 'B'])
  fireEvent.click(container.querySelector('[data-pin="B"]')!)
  expect(onPick).toHaveBeenCalledWith('b')
})

test('LocatePins puts the northern pin above the southern one', () => {
  const { container } = render(<LocatePins regions={square} regionId={R} pins={pins} onPick={vi.fn()} />)
  const y = (l: string) => Number(container.querySelector(`[data-pin="${l}"]`)!.getAttribute('data-y'))
  expect(y('A')).toBeLessThan(y('B'))
})
