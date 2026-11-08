// Kiểm tra JSON (unknown) thành dữ liệu có kiểu, dùng chung cho mọi loại dữ liệu (nội dung bài, ảnh, nông sản…).
// Sai cấu trúc thì ném ContentError kèm đường dẫn trường lỗi, ví dụ "items[0].title".
import type { ContentStatus } from '../types/content'

export class ContentError extends Error {
  readonly path: string
  constructor(path: string, message: string) {
    super(`${path || '(gốc)'}: ${message}`)
    this.name = 'ContentError'
    this.path = path
  }
}

export type Obj = Record<string, unknown>

export const join = (path: string, key: string) => (path ? `${path}.${key}` : key)

export function obj(v: unknown, path: string): Obj {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ContentError(path, 'cần là object')
  return Object.fromEntries(Object.entries(v))
}

export function arr(v: unknown, path: string): unknown[] {
  if (!Array.isArray(v)) throw new ContentError(path, 'cần là mảng')
  return v
}

export function list<T>(o: Obj, key: string, path: string, parseOne: (v: unknown, p: string) => T): T[] {
  const p = join(path, key)
  return arr(o[key], p).map((v, i) => parseOne(v, `${p}[${i}]`))
}

export function str(o: Obj, key: string, path: string): string {
  const v = o[key]
  if (typeof v !== 'string' || v.trim() === '') throw new ContentError(join(path, key), 'cần là chuỗi không rỗng')
  return v
}

export function optStr(o: Obj, key: string, path: string): string | undefined {
  return o[key] === undefined ? undefined : str(o, key, path)
}

export function num(o: Obj, key: string, path: string): number {
  const v = o[key]
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new ContentError(join(path, key), 'cần là số')
  return v
}

export function strList(o: Obj, key: string, path: string): string[] {
  return list(o, key, path, (v, p) => {
    if (typeof v !== 'string' || v.trim() === '') throw new ContentError(p, 'cần là chuỗi không rỗng')
    return v
  })
}

export function oneOf<T extends string>(o: Obj, key: string, path: string, allowed: readonly T[]): T {
  const v = o[key]
  const found = allowed.find((a) => a === v)
  if (found === undefined) throw new ContentError(join(path, key), `cần là một trong: ${allowed.join(', ')}`)
  return found
}

export function posInt(o: Obj, key: string, path: string): number {
  const v = num(o, key, path)
  if (!Number.isInteger(v) || v < 1) throw new ContentError(join(path, key), 'cần là số nguyên dương')
  return v
}

export const STATUSES: readonly ContentStatus[] = ['draft', 'verified']
