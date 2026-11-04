// Parser cho thư viện ảnh nhúng: chỉ nhận ảnh trên Wikimedia Commons với giấy phép tự do,
// để mọi ảnh hiện trên web đều được phép nhúng và ghi nguồn đầy đủ.
import { SECTIONS, type WebImage } from '../../types/content'
import { ContentError, STATUSES, join, list, num, obj, oneOf, optStr, str, strList, type Obj } from '../content/parse'

/** Public domain, CC0, CC BY, CC BY-SA. Không nhận NC, ND hay giấy phép khác */
export const ALLOWED_LICENSE = /^(Public domain|CC0( 1\.0)?|CC BY(-SA)? \d\.\d( [A-Za-z-]+)?)$/

const UPLOAD_PREFIX = 'https://upload.wikimedia.org/wikipedia/commons/'
const FILE_PAGE_PREFIX = 'https://commons.wikimedia.org/wiki/File:'

function urlWithPrefix(o: Obj, key: string, path: string, prefix: string): string {
  const v = str(o, key, path)
  if (!v.startsWith(prefix)) throw new ContentError(join(path, key), `cần bắt đầu bằng ${prefix}`)
  return v
}

function parseSrc(v: unknown, path: string): WebImage['src'] {
  const o = obj(v, path)
  return {
    url: urlWithPrefix(o, 'url', path, UPLOAD_PREFIX),
    width: num(o, 'width', path),
    height: num(o, 'height', path),
    srcset: list(o, 'srcset', path, (s, p) => {
      const so = obj(s, p)
      return { url: urlWithPrefix(so, 'url', p, UPLOAD_PREFIX), width: num(so, 'width', p) }
    }),
  }
}

function parseAttribution(v: unknown, path: string): WebImage['attribution'] {
  const o = obj(v, path)
  const license = typeof o.license === 'string' ? o.license : ''
  if (!ALLOWED_LICENSE.test(license)) throw new ContentError(join(path, 'license'), `giấy phép "${license}" không được nhận`)
  const licenseUrl = optStr(o, 'licenseUrl', path)
  if (license !== 'Public domain' && !licenseUrl) throw new ContentError(join(path, 'licenseUrl'), 'cần link giấy phép')
  return {
    title: str(o, 'title', path),
    author: str(o, 'author', path),
    authorUrl: optStr(o, 'authorUrl', path),
    license,
    licenseUrl,
    sourceUrl: urlWithPrefix(o, 'sourceUrl', path, FILE_PAGE_PREFIX),
  }
}

/** fileProvinceId: tỉnh suy ra từ tên file; null với _toan-vung.json */
function parseCover(v: unknown, path: string): true | undefined {
  if (v === undefined) return undefined
  if (v !== true) throw new ContentError(path, 'chỉ ghi "cover": true hoặc bỏ trống')
  return true
}

export function parseWebImages(raw: unknown, regionId: string, fileProvinceId: string | null, path: string): WebImage[] {
  return list({ images: raw }, 'images', '', (v, p) => {
    const at = path + p.slice('images'.length)
    const o = obj(v, at)
    if ((o.provinceId ?? null) !== fileProvinceId) {
      throw new ContentError(join(at, 'provinceId'), `cần là ${fileProvinceId === null ? 'null' : `"${fileProvinceId}"`} theo tên file`)
    }
    return {
      id: str(o, 'id', at),
      provider: oneOf(o, 'provider', at, ['wikimedia-commons'] as const),
      regionId,
      provinceId: fileProvinceId,
      section: oneOf(o, 'section', at, SECTIONS),
      itemIds: strList(o, 'itemIds', at),
      cover: parseCover(o.cover, join(at, 'cover')),
      alt: str(o, 'alt', at),
      caption: str(o, 'caption', at),
      src: parseSrc(o.src, join(at, 'src')),
      attribution: parseAttribution(o.attribution, join(at, 'attribution')),
      status: oneOf(o, 'status', at, STATUSES),
    }
  })
}
