// jsdom không có matchMedia: giả lập theo window.innerWidth (chỉ hiểu min-width/max-width) để test chọn bố cục desktop/điện thoại
type Listener = (e: { matches: boolean }) => void
const queries = new Map<string, Set<Listener>>()

function matches(query: string): boolean {
  const min = /min-width:\s*([\d.]+)px/.exec(query)
  const max = /max-width:\s*([\d.]+)px/.exec(query)
  const w = window.innerWidth
  return (!min || w >= Number(min[1])) && (!max || w <= Number(max[1]))
}

export function installMatchMedia() {
  window.matchMedia = (query: string) => {
    const set = queries.get(query) ?? new Set<Listener>()
    queries.set(query, set)
    return {
      get matches() {
        return matches(query)
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, l: Listener) => set.add(l),
      removeEventListener: (_: string, l: Listener) => set.delete(l),
      addListener: (l: Listener) => set.add(l),
      removeListener: (l: Listener) => set.delete(l),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList
  }
}

/** Đổi bề rộng cửa sổ trong test và báo cho các media query đang nghe */
export function setViewportWidth(width: number) {
  window.innerWidth = width
  for (const [query, set] of queries) for (const l of set) l({ matches: matches(query) })
}
