import { SGK_URL, sgkPageUrl } from './sources'

test('sgkPageUrl opens the viewer at book page n (viewer page n + 1)', () => {
  expect(sgkPageUrl(19)).toBe(`${SGK_URL}#page=20`)
})
