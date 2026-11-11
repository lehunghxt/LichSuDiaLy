// Phần thuần (không gọi mapshaper) của bước dựng lớp đất nước ngoài (tô xám) trong scripts/build-geo.mjs.

/**
 * Khung bao vùng biển của quần đảo Hoàng Sa và Trường Sa [tây, nam, đông, bắc], rộng hơn khung bao các đảo
 * trong dữ liệu Việt Nam một chút. Natural Earth gán một phần các đảo ở đây cho nước khác (và có mục "Spratly Is." riêng):
 * mọi đảo nhỏ của nước ngoài nằm trọn trong các khung này bị bỏ, và bản dựng xong không được còn đảo nào như vậy.
 * Khung Trường Sa chạm cả mũi bắc Borneo và bờ tây Palawan, nên chỉ xét đảo nhỏ (xem SMALL_ISLAND_DEG).
 */
export const ARCHIPELAGO_ZONES = [
  { name: 'Hoàng Sa', bbox: [111.2, 15.4, 113, 17.4] },
  { name: 'Trường Sa', bbox: [111.2, 6.9, 118, 11.8] },
]
/** Đảo có khung bao hẹp hơn chừng này (độ, cả hai chiều) mới tính là đảo của quần đảo; Borneo, Palawan lớn hơn nhiều */
const SMALL_ISLAND_DEG = 1

/** Mục Natural Earth không phải đất của một nước (Quần đảo Trường Sa, bãi cạn Scarborough) */
export const SKIPPED_ENTRIES = ['PGA', 'SCR']

/** Ba nước có chung đường biên trên đất liền với Việt Nam */
export const LAND_NEIGHBORS = ['CHN', 'LAO', 'KHM']

export const polygonsOf = (geometry) => (geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates])

function ringBox(ring) {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [x, y] of ring) {
    w = Math.min(w, x)
    s = Math.min(s, y)
    e = Math.max(e, x)
    n = Math.max(n, y)
  }
  return [w, s, e, n]
}

const inside = ([x, y], [w, s, e, n]) => x >= w && x <= e && y >= s && y <= n

/** Vùng quần đảo chứa mảnh đất này, nếu đó là một đảo nhỏ nằm trọn trong vùng Hoàng Sa hoặc Trường Sa */
function archipelagoOf(polygon) {
  const [w, s, e, n] = ringBox(polygon[0])
  if (e - w >= SMALL_ISLAND_DEG || n - s >= SMALL_ISLAND_DEG) return undefined
  return ARCHIPELAGO_ZONES.find(({ bbox }) => inside([w, s], bbox) && inside([e, n], bbox))
}

export const isArchipelagoPart = (polygon) => archipelagoOf(polygon) !== undefined

/**
 * Tách các nước trong Natural Earth thành đất nước ngoài (đã bỏ mảnh ở Hoàng Sa, Trường Sa) và ranh giới Việt Nam
 * theo Natural Earth (chỉ dùng để lấp khe giữa hai nguồn dữ liệu).
 */
export function splitCountries(features) {
  const foreign = []
  const vietnam = []
  for (const f of features) {
    const id = f.properties.ADM0_A3
    if (SKIPPED_ENTRIES.includes(id)) continue
    const polygons = polygonsOf(f.geometry).filter((p) => !isArchipelagoPart(p))
    if (polygons.length === 0) continue
    const feature = { type: 'Feature', properties: { id }, geometry: { type: 'MultiPolygon', coordinates: polygons } }
    ;(id === 'VNM' ? vietnam : foreign).push(feature)
  }
  return { foreign, vietnam }
}

const key = ([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`

/**
 * Hai nguồn vẽ biên giới hơi lệch nhau, nên giữa đất nước láng giềng (Natural Earth) và đất Việt Nam (thanglequoc)
 * có những khe hẹp. Khe là phần Việt Nam theo Natural Earth mà không thuộc Việt Nam theo thanglequoc (`gaps`).
 * Chỉ giữ khe chạm vào đất Trung Quốc, Lào, Cam-pu-chia (chung đỉnh với ranh giới của nước đó);
 * các mảnh dọc bờ biển bị bỏ, không thì bờ biển Việt Nam sẽ có viền xám.
 */
export function borderGaps(gaps, foreign) {
  const border = new Set(
    foreign.filter((f) => LAND_NEIGHBORS.includes(f.properties.id)).flatMap((f) => f.geometry.coordinates.flat(2).map(key)),
  )
  return gaps.filter((f) => polygonsOf(f.geometry).flat(2).some((c) => border.has(key(c))))
}

/** Tên vùng quần đảo mà lớp đất nước ngoài còn có đảo trong đó (rỗng là đạt) */
export function archipelagoViolations(collection) {
  const zones = collection.features.flatMap((f) => polygonsOf(f.geometry).map(archipelagoOf)).filter(Boolean)
  return [...new Set(zones.map((z) => z.name))]
}
