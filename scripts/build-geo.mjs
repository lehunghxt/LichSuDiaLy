// Dựng dữ liệu bản đồ tĩnh từ GeoJSON 34 tỉnh (thanglequoc/vietnamese-provinces-database v4.1.0, MIT).
//   raw/geo/thanglequoc-v4.1.0/provinces/*.geojson  +  src/data/provinces.json (tỉnh → vùng)
//   → public/maps/provinces.geojson  (34 tỉnh, đã đơn giản hoá)
//   → public/maps/regions.geojson    (gộp tỉnh theo vùng SGK)
//   → public/maps/labels.geojson     (điểm đặt nhãn Hoàng Sa, Trường Sa, Biển Đông)
//
// Chạy: npm run geo
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import mapshaper from 'mapshaper'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_DIR = path.join(ROOT, 'raw/geo/thanglequoc-v4.1.0/provinces')
const OUT_DIR = path.join(ROOT, 'public/maps')
const SIMPLIFY = '6%'
const PRECISION = '0.0001'

const provinces = JSON.parse(await readFile(path.join(ROOT, 'src/data/provinces.json'), 'utf8'))
const byCode = new Map(provinces.map((p) => [p.code, p]))

const features = []
for (const file of (await readdir(SRC_DIR)).filter((f) => f.endsWith('.geojson')).sort()) {
  const fc = JSON.parse(await readFile(path.join(SRC_DIR, file), 'utf8'))
  for (const f of fc.features) {
    const meta = byCode.get(f.properties.code)
    if (!meta) throw new Error(`Tỉnh mã ${f.properties.code} (${file}) chưa có trong src/data/provinces.json`)
    features.push({
      type: 'Feature',
      properties: { provinceId: meta.id, name: meta.name, regionId: meta.regionId },
      geometry: f.geometry,
    })
  }
}
if (features.length !== provinces.length) {
  throw new Error(`Có ${features.length} tỉnh trong GeoJSON nhưng ${provinces.length} tỉnh trong provinces.json`)
}

// Điểm đặt nhãn quần đảo: tâm khung bao của các phần lãnh thổ xa bờ thuộc Đà Nẵng (Hoàng Sa)
// và Khánh Hoà (Trường Sa), lấy trực tiếp từ dữ liệu, không tự đặt toạ độ.
function offshoreCenter(provinceId, minLng) {
  const f = features.find((x) => x.properties.provinceId === provinceId)
  const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]
  const pts = polys.filter((poly) => Math.min(...poly[0].map((c) => c[0])) > minLng).flatMap((poly) => poly[0])
  if (pts.length === 0) throw new Error(`Không tìm thấy phần lãnh thổ xa bờ của ${provinceId}`)
  const lngs = pts.map((c) => c[0])
  const lats = pts.map((c) => c[1])
  return [(Math.min(...lngs) + Math.max(...lngs)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2]
}

const labels = {
  type: 'FeatureCollection',
  features: [
    { name: 'Quần đảo Hoàng Sa', kind: 'archipelago', coordinates: offshoreCenter('da-nang', 110) },
    { name: 'Quần đảo Trường Sa', kind: 'archipelago', coordinates: offshoreCenter('khanh-hoa', 111) },
    // Vị trí đặt chữ "Biển Đông" (nhãn bản đồ, không phải dữ liệu địa lí)
    { name: 'Biển Đông', kind: 'sea', coordinates: [111.5, 14.5] },
  ].map(({ coordinates, ...properties }) => ({
    type: 'Feature',
    properties,
    geometry: { type: 'Point', coordinates: coordinates.map((n) => Number(n.toFixed(4))) },
  })),
}

const input = { 'provinces.json': { type: 'FeatureCollection', features } }
const simplify = `-simplify ${SIMPLIFY} weighted keep-shapes`
const out = { ...(await mapshaper.applyCommands(
  `-i provinces.json ${simplify} -clean -o provinces.geojson precision=${PRECISION} format=geojson`,
  input,
)), ...(await mapshaper.applyCommands(
  `-i provinces.json ${simplify} -clean -dissolve regionId -o regions.geojson precision=${PRECISION} format=geojson`,
  input,
)) }

await mkdir(OUT_DIR, { recursive: true })
for (const [name, content] of Object.entries(out)) {
  await writeFile(path.join(OUT_DIR, name), content)
  console.log(`✓ public/maps/${name}: ${Math.round(Buffer.byteLength(content) / 1024)} KB`)
}
await writeFile(path.join(OUT_DIR, 'labels.geojson'), JSON.stringify(labels))
console.log('✓ public/maps/labels.geojson')
