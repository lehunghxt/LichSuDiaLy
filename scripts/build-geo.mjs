// Dựng dữ liệu bản đồ tĩnh từ GeoJSON 34 tỉnh (thanglequoc/vietnamese-provinces-database v4.1.0, MIT).
//   raw/geo/thanglequoc-v4.1.0/provinces/*.geojson  +  src/data/provinces.json (tỉnh → vùng)
//   → public/maps/provinces.geojson  (34 tỉnh, đã đơn giản hoá)
//   → public/maps/regions.geojson    (gộp tỉnh theo vùng SGK)
//   → public/maps/labels.geojson     (điểm đặt nhãn Hoàng Sa, Trường Sa, Biển Đông, tên nước láng giềng)
// Natural Earth v5.1.2 (public domain): raw/geo/natural-earth-v5.1.2/countries.geojson
//   → public/maps/neighbors.geojson  (đất nước ngoài, tô xám làm nền; đã trừ đất Việt Nam)
//
// Chạy: npm run geo
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import mapshaper from 'mapshaper'
import { archipelagoViolations, borderGaps, splitCountries } from './lib/neighbors.mjs'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_DIR = path.join(ROOT, 'raw/geo/thanglequoc-v4.1.0/provinces')
const NE_FILE = path.join(ROOT, 'raw/geo/natural-earth-v5.1.2/countries.geojson')
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
    { name: 'QĐ. Hoàng Sa (Việt Nam)', kind: 'archipelago', coordinates: offshoreCenter('da-nang', 110) },
    { name: 'QĐ. Trường Sa (Việt Nam)', kind: 'archipelago', coordinates: offshoreCenter('khanh-hoa', 111) },
    // Vị trí đặt chữ "Biển Đông" (nhãn bản đồ, không phải dữ liệu địa lý)
    { name: 'Biển Đông', kind: 'sea', coordinates: [111.5, 14.5] },
    // Tên ba nước có chung biên giới đất liền, đặt giữa phần đất của nước đó trong khung nhìn toàn quốc
    { name: 'TRUNG QUỐC', kind: 'country', coordinates: [110.3, 23.3] },
    { name: 'LÀO', kind: 'country', coordinates: [103.4, 19.0] },
    { name: 'CAM-PU-CHIA', kind: 'country', coordinates: [104.7, 12.9] },
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

// Đất nước ngoài: tô xám làm nền để thấy Việt Nam nằm giữa các nước láng giềng.
// Đất các nước + khe biên giới + đất Việt Nam (để không còn khe) → gộp, đơn giản hoá → trừ đất Việt Nam ĐÃ đơn giản hoá
// (regions.geojson). Như vậy đường biên của lớp xám trùng khít đường biên vùng, không hở, không chồng.
// Đơn giản hoá hai mức: gần Việt Nam chi tiết hơn, xa (Ấn Độ, Úc, Nhật...) thô hơn cho file nhẹ.
const NEAR_BOX = 'bbox=98,4,122,26'
const ne = JSON.parse(await readFile(NE_FILE, 'utf8'))
const { foreign, vietnam } = splitCountries(ne.features)
const fc = (fs) => ({ type: 'FeatureCollection', features: fs })
// mapshaper xuất GeometryCollection khi không có thuộc tính → đổi về FeatureCollection
const asFeatures = (json) =>
  json.features ?? json.geometries.map((geometry) => ({ type: 'Feature', properties: {}, geometry }))
// Mỗi lần chạy một tập dữ liệu riêng: nạp chung (combine-files) làm mapshaper mất đất liền Trung Quốc khi gộp
const run = async (cmd, files) =>
  asFeatures(JSON.parse(Object.values(await mapshaper.applyCommands(`${cmd} -o out.json format=geojson`, files))[0]))
const vnFull = features.map((f) => ({ ...f, properties: {} }))
const gaps = await run('-i ne-vn.json -erase vn.json -explode', { 'ne-vn.json': fc(vietnam), 'vn.json': fc(vnFull) })
const land = fc([...foreign, ...borderGaps(gaps, foreign), ...vnFull].map((f) => ({ ...f, properties: {} })))
const near = await run(`-i land.json -dissolve2 -clip ${NEAR_BOX} -simplify interval=1200 keep-shapes -filter-islands min-area=20km2`, {
  'land.json': land,
})
const far = await run(`-i land.json -dissolve2 -erase ${NEAR_BOX} -simplify interval=10000 keep-shapes -filter-islands min-area=300km2`, {
  'land.json': land,
})
const neighbors = (await mapshaper.applyCommands(
  `-i land.json -dissolve2 -erase vn.json -explode -filter-islands min-area=20km2 -dissolve -each 'kind="foreign"' ` +
    `-o neighbors.geojson precision=${PRECISION} format=geojson`,
  { 'land.json': fc([...near, ...far]), 'vn.json': JSON.parse(out['regions.geojson']) },
))['neighbors.geojson']
const violations = archipelagoViolations(JSON.parse(neighbors))
if (violations.length) throw new Error(`Lớp đất nước ngoài có đảo nằm trong vùng quần đảo: ${violations.join(', ')}`)
out['neighbors.geojson'] = neighbors

await mkdir(OUT_DIR, { recursive: true })
for (const [name, content] of Object.entries(out)) {
  await writeFile(path.join(OUT_DIR, name), content)
  console.log(`✓ public/maps/${name}: ${Math.round(Buffer.byteLength(content) / 1024)} KB`)
}
await writeFile(path.join(OUT_DIR, 'labels.geojson'), JSON.stringify(labels))
console.log('✓ public/maps/labels.geojson')
