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

/** HTML của trường Artist/Credit → text sạch + link đầu tiên (nếu có) */
export function cleanArtist(html) {
  const author = decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
  const href = /href="([^"]+)"/.exec(html)?.[1]
  if (!href) return { author }
  const authorUrl = href.startsWith('//') ? `https:${href}` : href.startsWith('/') ? `https://commons.wikimedia.org${href}` : href
  return { author, authorUrl: decode(authorUrl) }
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
    old?.status === 'verified' &&
    old.src?.url === image.src.url &&
    JSON.stringify(old.attribution) === JSON.stringify(image.attribution)
  return same ? { ...image, status: 'verified' } : image
}
