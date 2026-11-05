// Hàm thuần xử lý dữ liệu API Wikimedia Commons cho thư viện ảnh nhúng (dùng bởi commons-fetch.mjs).
// Không gõ tay tác giả/giấy phép: mọi thông tin ghi nguồn lấy từ extmetadata của Commons.

/** Phải giống ALLOWED_LICENSE trong src/features/images/parseWebImages.ts (có test so sánh) */
export const ALLOWED_LICENSE = /^(Public domain|CC0( 1\.0)?|CC BY(-SA)? \d\.\d( [A-Za-z-]+)?)$/

export const USER_AGENT = 'em-kham-pha-lsdl/1.0 (https://em-kham-pha-lsdl.vercel.app; educational)'
const API = 'https://commons.wikimedia.org/w/api.php'
/** Commons chỉ trả thumbnail ở các bậc chuẩn; bậc khác (ví dụ 700px) trả lỗi 400 */
const BUCKETS = [500, 960, 1280]

export function apiUrl(titles) {
  const q = new URLSearchParams({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '960',
    format: 'json',
    formatversion: '2',
    titles: titles.join('|'),
  })
  return `${API}?${q}`
}

const ENTITIES = { nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }
const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
    return ENTITIES[e.toLowerCase()] ?? m
  })

/** Body JSON của API → các trang ảnh và bảng tên đã chuẩn hoá (tên mới → tên đã hỏi). API báo lỗi thì ném lỗi rõ ràng */
export function pagesOf(data) {
  if (data?.error) throw new Error(`Commons API lỗi ${data.error.code}: ${data.error.info}`)
  if (!Array.isArray(data?.query?.pages)) throw new Error('Commons API trả về dữ liệu không có query.pages')
  return { pages: data.query.pages, renamed: new Map((data.query.normalized ?? []).map((n) => [n.to, n.from])) }
}

/** Tên tác giả đã bỏ thẻ HTML → bỏ phần chữ ký wiki: (talk), (thảo luận), User:, mốc giờ, url, ngoặc wikitext */
export function cleanAuthorText(text) {
  return (
    text
      // [url Nhãn] → Nhãn; [Nhãn] → Nhãn
      .replace(/\[(?:https?:)?\/\/\S+\s+([^\]]+)\]/g, '$1')
      .replace(/\[([^\]]+)\]/g, '$1')
      .replace(/\(\s*(?:talk|thảo luận|more photos|User:[^)]*)\s*\)/gi, '')
      .replace(/\d{1,2}:\d{2}, \d{1,2} \w+ \d{4} \(UTC\)/g, '')
      .replace(/\d{1,2}:\d{2}, (?:ngày )?\d{1,2} tháng \d{1,2} năm \d{4} \(UTC\)/g, '')
      .replace(/,?\s*https?:\/\/\S+/g, '')
      .replace(/\btalk\b/gi, '')
      // vi:User:Tên (người dùng wiki tiếng Việt) → Tên
      .replace(/^[a-z]{2,3}:(?=\S)/, '')
      .replace(/\bUser:/g, '')
      .replace(/\s+([,/])/g, ' $1')
      .replace(/\s+,/g, ',')
      .replace(/\s+/g, ' ')
      .replace(/\s+\.$/, '')
      .replace(/[\s,/]+$/, '')
      .trim()
  )
}

/** Link tới trang wiki chưa tồn tại (redlink) mở form tạo trang → bỏ link, vẫn giữ tên tác giả */
export function cleanAuthorUrl(url) {
  if (!url || /[?&]redlink=1\b/.test(url) || /[?&]action=edit\b/.test(url)) return undefined
  return url
}

/** HTML của trường Artist/Credit → text sạch + link đầu tiên (nếu có) */
export function cleanArtist(html) {
  const raw = decode(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
  // Dọn xong mà rỗng (ví dụ tên chỉ là một link Flickr): giữ nguyên chữ gốc, còn hơn bỏ mất ảnh
  const author = cleanAuthorText(raw) || raw
  const href = /href="([^"]+)"/.exec(html)?.[1]
  const absolute = href && (href.startsWith('//') ? `https:${href}` : href.startsWith('/') ? `https://commons.wikimedia.org${href}` : href)
  const authorUrl = cleanAuthorUrl(absolute && decode(absolute))
  return authorUrl ? { author, authorUrl } : { author }
}

export function normalizeLicense(raw) {
  const t = raw.trim()
  const lower = t.toLowerCase()
  let out = t
  if (lower === 'pd' || lower.startsWith('pd-') || lower === 'public domain') out = 'Public domain'
  else if (/^cc0([ -]1\.0)?$/.test(lower)) out = lower.includes('1.0') ? 'CC0 1.0' : 'CC0'
  else {
    const m = /^cc[- ]by(-sa)?[- ](\d\.\d)[- ]?(.*)$/i.exec(t)
    if (m) out = `CC BY${m[1] ? '-SA' : ''} ${m[2]}${m[3] ? ` ${m[3].trim()}` : ''}`
  }
  return ALLOWED_LICENSE.test(out) ? out : null
}

/** Đưa link ảnh về upload.wikimedia.org và bỏ tham số utm_* mà API gắn thêm */
export function canonicalUrl(u) {
  const url = new URL(u)
  url.search = ''
  if (url.hostname === 'thumb.wikimedia.org') url.hostname = 'upload.wikimedia.org'
  return url.toString()
}

export function thumbSet(thumbUrl, origWidth, origUrl) {
  const set = thumbUrl.includes('/thumb/')
    ? BUCKETS.filter((w) => w < origWidth).map((w) => ({ url: thumbUrl.replace(/\/\d+px-/, `/${w}px-`), width: w }))
    : []
  if (origWidth <= BUCKETS[BUCKETS.length - 1]) set.push({ url: origUrl, width: origWidth })
  return set
}

export function slugify(title) {
  return title
    .replace(/^File:/i, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
}

const meta = (ii, key) => ii.extmetadata?.[key]?.value ?? ''

/** Một ảnh đã chọn (pick) + trang kết quả API → ảnh cho thư viện, hoặc lý do bỏ qua */
export function toWebImage(pick, page) {
  if (!pick.checked?.trim()) return { skip: 'chưa xem ảnh (thiếu "checked")' }
  const ii = page?.imageinfo?.[0]
  if (!page || page.missing || !ii) return { skip: 'file không tồn tại' }

  const rawLicense = meta(ii, 'LicenseShortName')
  const license = normalizeLicense(rawLicense)
  if (!license) return { skip: `giấy phép "${rawLicense}" không được nhận` }
  const licenseUrl = meta(ii, 'LicenseUrl') || undefined
  if (license !== 'Public domain' && !licenseUrl) return { skip: 'thiếu link giấy phép' }

  let who = cleanArtist(meta(ii, 'Artist'))
  if (!who.author) who = cleanArtist(meta(ii, 'Credit'))
  if (!who.author) return { skip: 'thiếu tác giả' }

  const set = thumbSet(canonicalUrl(ii.thumburl ?? ii.url), ii.width, canonicalUrl(ii.url))
  const main = set.find((s) => s.width === 960) ?? set[set.length - 1]
  if (!main) return { skip: 'không có kích thước ảnh phù hợp' }

  return {
    image: {
      id: `${pick.provinceId ?? '_toan-vung'}__${pick.slug ?? slugify(page.title)}`,
      provider: 'wikimedia-commons',
      provinceId: pick.provinceId ?? null,
      section: pick.section,
      itemIds: pick.itemIds ?? [],
      ...(pick.cover ? { cover: true } : {}),
      alt: pick.alt,
      caption: pick.caption,
      src: { url: main.url, width: main.width, height: Math.round((ii.height * main.width) / ii.width), srcset: set },
      attribution: {
        title: page.title,
        author: who.author,
        ...(who.authorUrl ? { authorUrl: who.authorUrl } : {}),
        license,
        ...(licenseUrl ? { licenseUrl } : {}),
        sourceUrl: canonicalUrl(ii.descriptionurl),
      },
      status: 'draft',
    },
  }
}

/** Giữ trạng thái "verified" đã duyệt nếu ảnh và thông tin ghi nguồn không đổi */
export function mergeStatus(image, existing) {
  const old = existing.find((e) => e.id === image.id)
  const same =
    old?.status === 'verified' && old.src?.url === image.src.url && JSON.stringify(old.attribution) === JSON.stringify(image.attribution)
  return same ? { ...image, status: 'verified' } : image
}

/** Tóm tắt kết quả commons-check. Link bị giới hạn tốc độ không tính là đã kiểm tra */
export function checkSummary({ total, broken, unchecked, only }) {
  const checked = total - unchecked.length
  const where = only ? ` của vùng ${only}` : ''
  const lines = [unchecked.length ? `Đã kiểm tra ${checked}/${total} link${where}.` : `Đã kiểm tra ${total} link${where}.`]
  if (unchecked.length) lines.push(`${unchecked.length} link chưa kiểm tra được vì Commons giới hạn tốc độ; chạy lại sau.`)
  if (broken.length) {
    lines.push(`${broken.length} link hỏng:`, ...broken.map((b) => `  - ${b.id}: ${b.why} ${b.url}`))
    return { lines, exitCode: 1 }
  }
  if (checked === 0 && total > 0) {
    lines.push('Chưa kiểm tra được link nào.')
    return { lines, exitCode: 1 }
  }
  lines.push(unchecked.length ? `Trong ${checked} link đã kiểm tra, không có link hỏng.` : 'Không có link hỏng.')
  return { lines, exitCode: 0 }
}
