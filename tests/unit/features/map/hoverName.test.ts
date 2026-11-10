import L from 'leaflet'
import { bindHoverName } from '../../../../src/features/map/hoverName'

const realMatchMedia = window.matchMedia

function setup(canHover: boolean, isSelected: () => boolean) {
  window.matchMedia = ((q: string) => ({ matches: q === '(hover: hover)' ? canHover : false, media: q })) as typeof window.matchMedia
  const el = document.createElement('div')
  document.body.appendChild(el)
  const map = L.map(el).setView([16, 107], 6)
  const layer = L.polygon([
    [15, 106],
    [17, 106],
    [17, 108],
  ]).addTo(map)
  bindHoverName(layer, 'Lâm Đồng', isSelected)
  return layer
}

afterEach(() => {
  window.matchMedia = realMatchMedia
  document.body.innerHTML = ''
})

test('with a mouse, hovering an area shows its name', () => {
  const layer = setup(true, () => false)
  layer.fire('mouseover', { latlng: L.latLng(16, 107) })
  expect(layer.isTooltipOpen()).toBe(true)
})

test('the selected area already has a name pin, so hovering it shows no second name', () => {
  const layer = setup(true, () => true)
  layer.fire('mouseover', { latlng: L.latLng(16, 107) })
  expect(layer.isTooltipOpen()).toBe(false)
})

test('clicking an area closes its hover name (the pin takes over)', () => {
  let selected = false
  const layer = setup(true, () => selected)
  layer.fire('mouseover', { latlng: L.latLng(16, 107) })
  selected = true
  layer.fire('click', { latlng: L.latLng(16, 107) })
  expect(layer.isTooltipOpen()).toBe(false)
})

test('touch screens get no hover name: a tap would leave it stuck on screen', () => {
  const layer = setup(false, () => false)
  layer.fire('mouseover', { latlng: L.latLng(16, 107) })
  expect(layer.getTooltip()).toBeUndefined()
})
