// Quy tắc tổ chức code (docs/KIEN_TRUC.md). Phụ thuộc chỉ đi một chiều:
//   app → pages → features → components / lib / types / data / styles
// Tính năng không phụ thuộc vòng tròn vào nhau, và dùng nhau qua "cửa chính" features/<x>/index.ts.
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(import.meta.dirname, '..')
const rel = (p: string) => path.relative(SRC, p).split(path.sep).join('/')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name === 'test' && dir === SRC ? [] : sourceFiles(p)
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : []
  })
}

/** Mỗi import tương đối của mọi file nguồn (không tính test): từ file nào, tới đường dẫn nào trong src */
const imports = sourceFiles(SRC).flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/(?:import|export)[^'"]*?from\s+'(\.[^']+)'|import\s*\(\s*'(\.[^']+)'\s*\)/g)].map((m) => ({
    from: rel(file),
    to: rel(path.resolve(path.dirname(file), m[1] ?? m[2]!)),
  })),
)

/** Tầng của một đường dẫn: app, pages, features, components, lib, types, data, styles (main.tsx thuộc app) */
const layerOf = (p: string) => (p === 'main.tsx' ? 'app' : p.split('/')[0]!)
const featureOf = (p: string) => (p.startsWith('features/') ? p.split('/')[1]! : null)

// Tầng thấp được phép import những tầng nào
const ALLOWED: Record<string, string[]> = {
  app: ['app', 'pages', 'features', 'components', 'lib', 'types', 'data', 'styles'],
  pages: ['pages', 'features', 'components', 'lib', 'types', 'data'],
  features: ['features', 'components', 'lib', 'types', 'data'],
  components: ['components', 'lib', 'types'],
  lib: ['lib', 'types', 'data'],
  types: ['types'],
}

test('dependencies only point down: app → pages → features → components / lib / types', () => {
  const wrong = imports.filter(({ from, to }) => {
    const allowed = ALLOWED[layerOf(from)]
    return allowed !== undefined && !allowed.includes(layerOf(to))
  })
  expect(wrong.map(({ from, to }) => `${from} → ${to}`)).toEqual([])
})

test('features do not depend on each other in a circle', () => {
  const graph = new Map<string, Set<string>>()
  for (const { from, to } of imports) {
    const a = featureOf(from)
    const b = featureOf(to)
    if (a && b && a !== b) graph.set(a, (graph.get(a) ?? new Set()).add(b))
  }
  const cycles: string[] = []
  const visit = (node: string, trail: string[]) => {
    if (trail.includes(node)) {
      cycles.push([...trail.slice(trail.indexOf(node)), node].join(' → '))
      return
    }
    for (const next of graph.get(node) ?? []) visit(next, [...trail, node])
  }
  for (const node of graph.keys()) visit(node, [])
  expect([...new Set(cycles)]).toEqual([])
})
